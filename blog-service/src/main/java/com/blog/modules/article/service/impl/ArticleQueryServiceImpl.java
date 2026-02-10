package com.blog.modules.article.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.article.model.dto.ArticleQueryDTO;
import com.blog.modules.article.model.entity.ArticleTag;
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
import com.blog.modules.file.model.vo.FileVO;
import com.blog.modules.file.service.FileService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @Autowired
    private FileService fileService;

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
            // 避免在后台列表中对 LONGTEXT(content) 做 LIKE 全表扫描；
            // 需要全文检索时应走搜索模块（ES/FTS）。
            wrapper.and(w -> w.like(Article::getTitle, keyword)
                    .or().like(Article::getExcerpt, keyword));
        }
        // 列表查询排除 content 字段（LONGTEXT），避免不必要的大数据传输
        wrapper.select(Article.class, info -> !"content".equals(info.getColumn()));

        wrapper.orderByDesc(Article::getUpdateTime);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);

        List<Article> records = result.getRecords();

        List<Long> articleIds = records.stream()
                .filter(Objects::nonNull)
                .map(Article::getId)
                .collect(Collectors.toList());

        // 批量查询分类
        Map<Long, Category> categoryMap = Map.of();
        List<Long> categoryIds = records.stream()
                .filter(Objects::nonNull)
                .map(Article::getCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (!categoryIds.isEmpty()) {
            categoryMap = categoryMapper.selectBatchIds(categoryIds).stream()
                    .collect(Collectors.toMap(Category::getId, c -> c));
        }

        // 批量查询标签
        Map<Long, List<TagVO>> tagsByArticleId = Map.of();
        if (!articleIds.isEmpty()) {
            List<ArticleTag> articleTags =
                    articleTagMapper.selectByArticleIds(articleIds);
            if (!articleTags.isEmpty()) {
                Map<Long, List<Long>> tagIdsByArticleId = articleTags.stream()
                        .collect(Collectors.groupingBy(
                                ArticleTag::getArticleId,
                                Collectors.mapping(
                                        ArticleTag::getTagId,
                                        Collectors.toList()
                                )
                        ));
                List<Long> tagIds = articleTags.stream()
                        .map(ArticleTag::getTagId)
                        .distinct()
                        .collect(Collectors.toList());
                Map<Long, TagVO> tagVOMap = new HashMap<>();
                if (!tagIds.isEmpty()) {
                    List<Tag> tags = tagMapper.selectBatchIds(tagIds);
                    for (Tag tag : tags) {
                        TagVO tagVO = BeanUtil.copyProperties(tag, TagVO.class);
                        tagVOMap.put(tag.getId(), tagVO);
                    }
                }
                Map<Long, List<TagVO>> grouped = new HashMap<>();
                for (Map.Entry<Long, List<Long>> entry : tagIdsByArticleId.entrySet()) {
                    List<TagVO> tagVOs = new ArrayList<>();
                    for (Long tagId : entry.getValue()) {
                        TagVO tagVO = tagVOMap.get(tagId);
                        if (tagVO != null) {
                            tagVOs.add(tagVO);
                        }
                    }
                    grouped.put(entry.getKey(), tagVOs);
                }
                tagsByArticleId = grouped;
            }
        }

        final Map<Long, Category> finalCategoryMap = categoryMap;
        final Map<Long, List<TagVO>> finalTagsByArticleId = tagsByArticleId;

        List<ArticleVO> voList = records.stream()
                .map(article -> convertToVO(
                        article,
                        List.of(),
                        finalCategoryMap,
                        finalTagsByArticleId
                ))
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public ArticleVO getById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            return null;
        }
        return convertToVO(article, null);
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

        QueryWrapper<Article> aggregateWrapper = new QueryWrapper<>();
        aggregateWrapper.select(
                "COALESCE(SUM(view_count), 0) AS totalViewCount",
                "COALESCE(SUM(like_count), 0) AS totalLikeCount",
                "COALESCE(SUM(comment_count), 0) AS totalCommentCount"
        );
        Map<String, Object> aggregate = articleMapper.selectMaps(aggregateWrapper).stream()
                .findFirst()
                .orElse(Map.of());
        long totalViewCount = toLong(aggregate.get("totalViewCount"));
        long totalLikeCount = toLong(aggregate.get("totalLikeCount"));
        long totalCommentCount = toLong(aggregate.get("totalCommentCount"));
        
        statistics.setTotalViewCount(totalViewCount);
        statistics.setTotalLikeCount(totalLikeCount);
        statistics.setTotalCommentCount(totalCommentCount);
        
        return statistics;
    }

    private long toLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value == null) {
            return 0L;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private ArticleVO convertToVO(Article article, List<FileVO> referencedFiles) {
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

        // 如果提供了文件列表则使用，否则查询
        if (referencedFiles == null) {
            referencedFiles = fileService.listByReference("ARTICLE", article.getId());
        }
        vo.setReferencedFiles(referencedFiles);

        return vo;
    }

    private ArticleVO convertToVO(
            Article article,
            List<FileVO> referencedFiles,
            Map<Long, Category> categoryMap,
            Map<Long, List<TagVO>> tagsByArticleId
    ) {
        ArticleVO vo = BeanUtil.copyProperties(article, ArticleVO.class);
        if (article.getCategoryId() != null && categoryMap != null && !categoryMap.isEmpty()) {
            Category category = categoryMap.get(article.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }
        if (tagsByArticleId != null && !tagsByArticleId.isEmpty()) {
            List<TagVO> tagVOs = tagsByArticleId.get(article.getId());
            if (tagVOs != null) {
                vo.setTags(tagVOs);
            }
        }

        // 如果提供了文件列表则使用，否则查询
        if (referencedFiles == null) {
            referencedFiles = fileService.listByReference("ARTICLE", article.getId());
        }
        vo.setReferencedFiles(referencedFiles);

        return vo;
    }
}
