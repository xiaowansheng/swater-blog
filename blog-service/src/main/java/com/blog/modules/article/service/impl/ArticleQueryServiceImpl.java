package com.blog.modules.article.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.article.model.dto.ArticleQueryDTO;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.tag.model.entity.Tag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.model.vo.ArticleStatisticsVO;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.article.service.ArticleQueryService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class ArticleQueryServiceImpl implements ArticleQueryService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    public PageResult<ArticleVO> list(ArticleQueryDTO queryDTO) {
        Page<Article> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getId() != null) {
            wrapper.eq(Article::getId, queryDTO.getId());
        }
        if (queryDTO.getArticleKey() != null && !queryDTO.getArticleKey().trim().isEmpty()) {
            wrapper.eq(Article::getArticleKey, queryDTO.getArticleKey().trim());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Article::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(Article::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getType() != null && !queryDTO.getType().trim().isEmpty()) {
            wrapper.eq(Article::getType, queryDTO.getType().trim());
        }
        if (queryDTO.getIsTop() != null) {
            wrapper.eq(Article::getIsTop, queryDTO.getIsTop());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            String keyword = queryDTO.getKeyword().trim();
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
        if (article == null) {
            return null;
        }
        return convertToVO(article);
    }

    @Override
    public ArticleStatisticsVO getStatistics() {
        ArticleStatisticsVO statistics = new ArticleStatisticsVO();
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();

        statistics.setTotalCount(articleMapper.selectCount(wrapper).longValue());

        LambdaQueryWrapper<Article> publishedWrapper = new LambdaQueryWrapper<>();
        publishedWrapper.eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode());
        statistics.setPublishedCount(articleMapper.selectCount(publishedWrapper).longValue());
        
        LambdaQueryWrapper<Article> draftWrapper = new LambdaQueryWrapper<>();
        draftWrapper.eq(Article::getStatus, ArticleStatus.DRAFT.getCode());
        statistics.setDraftCount(articleMapper.selectCount(draftWrapper).longValue());

        LambdaQueryWrapper<Article> allWrapper = new LambdaQueryWrapper<>();
        List<Article> articles = articleMapper.selectList(allWrapper);
        long totalViewCount = 0;
        long totalLikeCount = 0;
        long totalCommentCount = 0;
        
        if (articles != null && !articles.isEmpty()) {
            totalViewCount = articles.stream().mapToLong(a -> a.getViewCount() != null ? a.getViewCount() : 0L).sum();
            totalLikeCount = articles.stream().mapToLong(a -> a.getLikeCount() != null ? a.getLikeCount() : 0L).sum();
            totalCommentCount = articles.stream().mapToLong(a -> a.getCommentCount() != null ? a.getCommentCount() : 0L).sum();
        }
        
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
