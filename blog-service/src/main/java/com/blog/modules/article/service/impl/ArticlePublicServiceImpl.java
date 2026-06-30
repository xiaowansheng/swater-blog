package com.blog.modules.article.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.tag.model.entity.Tag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.article.service.ArticlePublicService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
@Service
public class ArticlePublicServiceImpl implements ArticlePublicService {

    /** 加密文章解锁 token 的 Redis key 前缀：article:pwd:{articleId}:{token} */
    private static final String UNLOCK_TOKEN_PREFIX = "article:pwd:";

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /** 解锁 token 有效期，默认 7 天 */
    @Value("${blog.article.unlock-token-ttl-days:7}")
    private long unlockTokenTtlDays;

    @Override
    @Cacheable(
            value = "article:list",
            key = "#page + ':' + #size + ':' + (#categoryId != null ? #categoryId : 'null') + ':' + (#tagId != null ? #tagId : 'null')",
            unless = "#keyword != null && !#keyword.trim().isEmpty()"
    )
    public PageResult<ArticleVO> list(Long page, Long size, Long categoryId, Long tagId, String keyword) {
        Page<Article> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode());

        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }
        if (tagId != null) {
            List<Long> articleIds = articleTagMapper.selectArticleIdsByTagId(tagId);
            if (articleIds != null && !articleIds.isEmpty()) {
                wrapper.in(Article::getId, articleIds);
            } else {
                return new PageResult<>(List.of(), 0L, size != null ? size : 10L, page != null ? page : 1L);
            }
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Article::getTitle, keyword)
                    .or().like(Article::getContent, keyword)
                    .or().like(Article::getExcerpt, keyword));
        }
        // 只有首页查询（无分类、无标签）才按置顶排序，分类/标签查询按时间排序
        if (categoryId == null && tagId == null) {
            wrapper.orderByDesc(Article::getIsTop);
        }
        wrapper.orderByDesc(Article::getPublishedAt);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = convertToListVO(result.getRecords());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public ArticleVO getById(Long id) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getId, id)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode()));
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    public ArticleVO getBySlug(String slug) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getSlug, slug)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode()));
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    public ArticleVO getByKey(String key) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getArticleKey, key)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode()));
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    @Cacheable(value = "article:hot", key = "#limit != null ? #limit : 10")
    public List<ArticleVO> getHotArticles(Integer limit) {
        List<Article> articles = articleMapper.selectHotArticles(limit != null ? limit : 10);
        return convertToListVO(articles);
    }

    @Override
    @Cacheable(value = "article:latest", key = "#limit != null ? #limit : 10")
    public List<ArticleVO> getLatestArticles(Integer limit) {
        List<Article> articles = articleMapper.selectLatestArticles(limit != null ? limit : 10);
        return convertToListVO(articles);
    }

    @Override
    @Cacheable(value = "article:related", key = "#articleId + ':' + (#limit != null ? #limit : 6)")
    public List<ArticleVO> getRelatedArticles(Long articleId, Integer limit) {
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return Collections.emptyList();
        }
        int effectiveLimit = limit != null ? limit : 6;
        List<Article> related = articleMapper.selectRelatedArticles(
                articleId,
                article.getCategoryId(),
                effectiveLimit * 2
        );
        List<Article> result = new ArrayList<>();
        for (Article a : related) {
            if (a.getPassword() != null && !a.getPassword().isEmpty()) {
                continue;
            }
            result.add(a);
            if (result.size() >= effectiveLimit) {
                break;
            }
        }
        return convertToListVO(result);
    }

    @Override
    public boolean verifyPassword(Long articleId, String password) {
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return false;
        }
        String stored = article.getPassword();
        if (!StringUtils.hasText(stored)) {
            return true;
        }
        // 兼容历史明文：BCrypt 哈希固定以 "$2" 开头，旧明文密码按常量时间比对
        if (stored.startsWith("$2")) {
            try {
                return com.blog.shared.util.PasswordUtil.matches(password, stored);
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
        return java.security.MessageDigest.isEqual(
                stored.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @Override
    public ArticleVO getByIdWithContent(Long id) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getId, id)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode()));
        if (article == null) {
            return null;
        }
        ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
                vo.setCategoryKey(category.getCategoryKey());
            }
        }
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(article.getId());
        if (tagIds != null && !tagIds.isEmpty()) {
            List<Tag> tags = tagMapper.selectBatchIds(tagIds);
            List<TagVO> tagVOs = BeanUtil.copyList(tags, TagVO.class);
            vo.setTags(tagVOs);
        }
        vo.setHasPassword(StringUtils.hasText(article.getPassword()));
        return vo;
    }

    @Override
    public String verifyAndIssueToken(Long articleId, String password) {
        if (!verifyPassword(articleId, password)) {
            return null;
        }
        // 密码正确：签发随机 token 并写入 Redis，绑定 articleId，避免存明文密码到客户端
        String token = java.util.UUID.randomUUID().toString().replace("-", "");
        String key = UNLOCK_TOKEN_PREFIX + articleId + ":" + token;
        try {
            redisTemplate.opsForValue().set(key, "1", Duration.ofDays(unlockTokenTtlDays));
        } catch (Exception e) {
            // Redis 不可用时降级：返回一次性 token 但不入缓存，后续无法凭 token 复用
            // （前端此时已拿到本次正文，不影响本次访问）
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("签发文章解锁 token 失败（Redis 异常），仅本次有效: articleId={}", articleId, e);
        }
        return token;
    }

    @Override
    public ArticleVO getByUnlockToken(Long articleId, String token) {
        if (!StringUtils.hasText(token)) {
            return null;
        }
        String key = UNLOCK_TOKEN_PREFIX + articleId + ":" + token;
        boolean valid;
        try {
            Object val = redisTemplate.opsForValue().get(key);
            valid = val != null;
        } catch (Exception e) {
            // Redis 异常时拒绝，避免密码门控被绕过
            return null;
        }
        if (!valid) {
            return null;
        }
        return getByIdWithContent(articleId);
    }

    private List<ArticleVO> convertToListVO(List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return Collections.emptyList();
        }
        // 1. 一次性查询所有分类
        List<Long> categoryIds = articles.stream().map(Article::getCategoryId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, Category> categoryMap = categoryIds.isEmpty() ? new HashMap<>() :
                categoryMapper.selectBatchIds(categoryIds).stream()
                        .collect(Collectors.toMap(Category::getId, category -> category));

        // 2. 一次性查询所有文章的标签关系
        List<Long> articleIds = articles.stream().map(Article::getId).collect(Collectors.toList());
        List<ArticleTag> articleTags = articleTagMapper.selectByArticleIds(articleIds);

        // 3. 一次性查询所有需要的标签
        List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, TagVO> tagMap = tagIds.isEmpty() ? new HashMap<>() :
                tagMapper.selectBatchIds(tagIds).stream()
                        .map(tag -> BeanUtil.copyProperties(tag, TagVO.class))
                        .collect(Collectors.toMap(TagVO::getId, tag -> tag));

        // 4. 在内存中组装标签到文章
        Map<Long, List<TagVO>> articleTagMap = articleTags.stream()
                .collect(Collectors.groupingBy(ArticleTag::getArticleId,
                        Collectors.mapping(at -> tagMap.get(at.getTagId()), Collectors.toList())));

        // 5. 组装最终VO
        return articles.stream().map(article -> {
            ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
            Category category = categoryMap.get(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
                vo.setCategoryKey(category.getCategoryKey());
            }
            vo.setTags(articleTagMap.get(article.getId()));
            boolean hasPassword = StringUtils.hasText(article.getPassword());
            vo.setHasPassword(hasPassword);
            if (hasPassword) {
                vo.setContent(null);
            }
            return vo;
        }).collect(Collectors.toList());
    }

    private ArticleVO convertToVO(Article article) {
        ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
                vo.setCategoryKey(category.getCategoryKey());
            }
        }
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(article.getId());
        if (tagIds != null && !tagIds.isEmpty()) {
            List<Tag> tags = tagMapper.selectBatchIds(tagIds);
            List<TagVO> tagVOs = BeanUtil.copyList(tags, TagVO.class);
            vo.setTags(tagVOs);
        }
        boolean hasPassword = StringUtils.hasText(article.getPassword());
        vo.setHasPassword(hasPassword);
        if (hasPassword) {
            vo.setContent(null);
        }
        return vo;
    }
}

