package com.blog.modules.archive.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.archive.service.ArchivePublicService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ArchivePublicServiceImpl implements ArchivePublicService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    public PageResult<ArticleVO> list(Long page, Long size) {
        Page<Article> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode());
        // 归档查询只按创建时间倒序，不考虑置顶
        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = convertToListVO(result.getRecords());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    private List<ArticleVO> convertToListVO(List<Article> articles) {
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
