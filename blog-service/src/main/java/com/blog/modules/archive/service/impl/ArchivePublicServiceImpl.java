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
    private ArchiveArticleConverter articleConverter;

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
        // 排除加密文章，避免加密文章的正文/摘要暴露在归档列表
        wrapper.and(w -> w.isNull(Article::getPassword).or().eq(Article::getPassword, ""));
        // 归档查询只按创建时间倒序，不考虑置顶
        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = articleConverter.convertToListVO(result.getRecords());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }


}
