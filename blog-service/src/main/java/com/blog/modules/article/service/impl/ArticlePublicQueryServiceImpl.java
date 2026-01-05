package com.blog.modules.article.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
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
import com.blog.modules.article.service.ArticlePublicQueryService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class ArticlePublicQueryServiceImpl implements ArticlePublicQueryService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    @Cacheable(value = "article:list", key = "#page + ':' + #size + ':' + (#categoryId != null ? #categoryId : 'null') + ':' + (#tagId != null ? #tagId : 'null') + ':' + (#keyword != null ? #keyword : 'null')")
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
        wrapper.orderByDesc(Article::getIsTop);
        wrapper.orderByDesc(Article::getPublishedAt);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = convertToListVO(result.getRecords());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Cacheable(value = "article", key = "#id")
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
    @Cacheable(value = "article:slug", key = "#slug")
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
    @Cacheable(value = "article:key", key = "#key")
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

    private List<ArticleVO> convertToListVO(List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return Collections.emptyList();
        }
        // 1. 一次性查询所有分类
        List<Long> categoryIds = articles.stream().map(Article::getCategoryId).distinct().collect(Collectors.toList());
        Map<Long, String> categoryMap = categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        // 2. 一次性查询所有文章的标签关系
        List<Long> articleIds = articles.stream().map(Article::getId).collect(Collectors.toList());
        List<ArticleTag> articleTags = articleTagMapper.selectByArticleIds(articleIds);

        // 3. 一次性查询所有需要的标签
        List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).distinct().collect(Collectors.toList());
        Map<Long, TagVO> tagMap = tagMapper.selectBatchIds(tagIds).stream()
                .map(tag -> BeanUtil.copyProperties(tag, TagVO.class))
                .collect(Collectors.toMap(TagVO::getId, tag -> tag));

        // 4. 在内存中组装标签到文章
        Map<Long, List<TagVO>> articleTagMap = articleTags.stream()
                .collect(Collectors.groupingBy(ArticleTag::getArticleId,
                        Collectors.mapping(at -> tagMap.get(at.getTagId()), Collectors.toList())));

        // 5. 组装最终VO
        return articles.stream().map(article -> {
            ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
            vo.setCategoryName(categoryMap.get(article.getCategoryId()));
            vo.setTags(articleTagMap.get(article.getId()));
            return vo;
        }).collect(Collectors.toList());
    }

    private ArticleVO convertToVO(Article article) {
        ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }
        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(article.getId());
        if (tagIds != null && !tagIds.isEmpty()) {
            List<Tag> tags = tagMapper.selectBatchIds(tagIds);
            List<TagVO> tagVOs = BeanUtil.copyList(tags, TagVO.class);
            vo.setTags(tagVOs);
        }
        return vo;
    }
}

