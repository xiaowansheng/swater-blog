package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.ArticleTagMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.mapper.TagMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Category;
import com.blog.model.entity.Tag;
import com.blog.model.enums.ArticleStatus;
import com.blog.model.vo.ArticleVO;
import com.blog.model.vo.TagVO;
import com.blog.service.ArticlePublicQueryService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
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
        wrapper.eq(Article::getDeleted, 0);
        
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
        List<ArticleVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Cacheable(value = "article", key = "#id")
    public ArticleVO getById(Long id) {
        Article article = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getId, id)
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode())
                .eq(Article::getDeleted, 0));
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
                .eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode())
                .eq(Article::getDeleted, 0));
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    @Cacheable(value = "article:hot", key = "#limit != null ? #limit : 10")
    public List<ArticleVO> getHotArticles(Integer limit) {
        List<Article> articles = articleMapper.selectHotArticles(limit != null ? limit : 10);
        return articles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "article:latest", key = "#limit != null ? #limit : 10")
    public List<ArticleVO> getLatestArticles(Integer limit) {
        List<Article> articles = articleMapper.selectLatestArticles(limit != null ? limit : 10);
        return articles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
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

