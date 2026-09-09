package com.blog.modules.archive.service.impl;

import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.shared.util.BeanUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 归档文章 VO 组装器：批量补齐分类、标签信息。
 * 供管理端与公开端归档查询共用，避免转换逻辑重复。
 */
@Component
class ArchiveArticleConverter {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    List<ArticleVO> convertToListVO(List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return Collections.emptyList();
        }
        // 批量查询分类
        List<Long> categoryIds = articles.stream().map(Article::getCategoryId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, Category> categoryMap = categoryIds.isEmpty() ? new HashMap<>() :
                categoryMapper.selectBatchIds(categoryIds).stream()
                        .collect(Collectors.toMap(Category::getId, c -> c));

        // 批量查询标签关系
        List<Long> articleIds = articles.stream().map(Article::getId).collect(Collectors.toList());
        List<ArticleTag> articleTags = articleTagMapper.selectByArticleIds(articleIds);

        // 批量查询标签
        List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, TagVO> tagMap = tagIds.isEmpty() ? new HashMap<>() :
                tagMapper.selectBatchIds(tagIds).stream()
                        .map(tag -> BeanUtil.copyProperties(tag, TagVO.class))
                        .collect(Collectors.toMap(TagVO::getId, tag -> tag));

        // 组装标签到文章
        Map<Long, List<TagVO>> articleTagMap = articleTags.stream()
                .collect(Collectors.groupingBy(ArticleTag::getArticleId,
                        Collectors.mapping(at -> tagMap.get(at.getTagId()), Collectors.toList())));

        return articles.stream().map(article -> {
            ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
            Category category = categoryMap.get(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
                vo.setCategoryKey(category.getCategoryKey());
            }
            vo.setTags(articleTagMap.get(article.getId()));
            return vo;
        }).collect(Collectors.toList());
    }
}
