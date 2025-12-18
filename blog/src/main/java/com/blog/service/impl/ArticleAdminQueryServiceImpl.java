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
import com.blog.model.vo.ArticleVO;
import com.blog.model.vo.ArticleStatisticsVO;
import com.blog.model.vo.TagVO;
import com.blog.service.ArticleAdminQueryService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleAdminQueryServiceImpl implements ArticleAdminQueryService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    public PageResult<ArticleVO> list(Long page, Long size, Integer status, Long categoryId, String keyword) {
        Page<Article> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getDeleted, 0);
        
        if (status != null) {
            wrapper.eq(Article::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Article::getTitle, keyword)
                    .or().like(Article::getContent, keyword)
                    .or().like(Article::getExcerpt, keyword));
        }
        wrapper.orderByDesc(Article::getIsTop);
        wrapper.orderByDesc(Article::getCreateTime);
        
        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public ArticleVO getById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getDeleted() == 1) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    public ArticleStatisticsVO getStatistics() {
        ArticleStatisticsVO statistics = new ArticleStatisticsVO();
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getDeleted, 0);
        
        statistics.setTotalCount(articleMapper.selectCount(wrapper).longValue());
        
        LambdaQueryWrapper<Article> publishedWrapper = new LambdaQueryWrapper<>();
        publishedWrapper.eq(Article::getDeleted, 0).eq(Article::getStatus, 1);
        statistics.setPublishedCount(articleMapper.selectCount(publishedWrapper).longValue());
        
        LambdaQueryWrapper<Article> draftWrapper = new LambdaQueryWrapper<>();
        draftWrapper.eq(Article::getDeleted, 0).eq(Article::getStatus, 0);
        statistics.setDraftCount(articleMapper.selectCount(draftWrapper).longValue());
        
        LambdaQueryWrapper<Article> allWrapper = new LambdaQueryWrapper<>();
        allWrapper.eq(Article::getDeleted, 0);
        List<Article> articles = articleMapper.selectList(allWrapper);
        long totalViewCount = articles.stream().mapToLong(a -> a.getViewCount() != null ? a.getViewCount() : 0L).sum();
        long totalLikeCount = articles.stream().mapToLong(a -> a.getLikeCount() != null ? a.getLikeCount() : 0L).sum();
        long totalCommentCount = articles.stream().mapToLong(a -> a.getCommentCount() != null ? a.getCommentCount() : 0L).sum();
        
        statistics.setTotalViewCount(totalViewCount);
        statistics.setTotalLikeCount(totalLikeCount);
        statistics.setTotalCommentCount(totalCommentCount);
        
        return statistics;
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

