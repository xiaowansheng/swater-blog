//package com.blog.plugin.search.impl;
//
//import com.blog.common.PageResult;
//import com.blog.modules.article.mapper.ArticleMapper;
//import com.blog.modules.article.mapper.ArticleTagMapper;
//import com.blog.modules.category.mapper.CategoryMapper;
//import com.blog.modules.comment.mapper.CommentMapper;
//import com.blog.modules.tag.mapper.TagMapper;
//import com.blog.modules.talk.mapper.TalkMapper;
//import com.blog.modules.user.mapper.UserMapper;
//import com.blog.modules.comment.model.document.CommentDocument;
//import com.blog.modules.talk.model.document.MomentDocument;
//import com.blog.modules.article.model.document.PostDocument;
//import com.blog.modules.category.model.entity.Category;
//import com.blog.modules.tag.model.entity.Tag;
//import com.blog.modules.user.model.entity.User;
//import com.blog.modules.search.model.vo.SearchVO;
//import com.blog.core.plugin.core.Plugin;
//import com.blog.core.plugin.search.SearchPlugin;
//import com.blog.core.repository.CommentDocumentRepository;
//import com.blog.core.repository.MomentDocumentRepository;
//import com.blog.core.repository.PostDocumentRepository;
//import co.elastic.clients.elasticsearch._types.query_dsl.Query;
//import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
//import org.springframework.data.elasticsearch.core.SearchHit;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
//// @Component
//// @ConditionalOnProperty(name = "search.provider.type", havingValue = "elasticsearch", matchIfMissing = true)
//public class ElasticsearchSearchPlugin implements SearchPlugin, Plugin {
//
//    @Autowired(required = false)
//    private ElasticsearchOperations elasticsearchOperations;
//
//    @Autowired
//    private PostDocumentRepository postDocumentRepository;
//
//    @Autowired
//    private MomentDocumentRepository momentDocumentRepository;
//
//    @Autowired
//    private CommentDocumentRepository commentDocumentRepository;
//
//    @Autowired
//    private ArticleMapper articleMapper;
//
//    @Autowired
//    private TalkMapper talkMapper;
//
//    @Autowired
//    private CommentMapper commentMapper;
//
//    @Autowired
//    private UserMapper userMapper;
//
//    @Autowired
//    private CategoryMapper categoryMapper;
//
//    @Autowired
//    private TagMapper tagMapper;
//
//    @Autowired
//    private ArticleTagMapper articleTagMapper;
//
//    @Override
//    public String getName() {
//        return "elasticsearch";
//    }
//
//    @Override
//    public boolean isEnabled() {
//        return elasticsearchOperations != null;
//    }
//
//    @Override
//    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
//        if (!isEnabled()) {
//            return new PageResult<>(List.of(), 0L, size, page);
//        }
//
//        Pageable pageable = PageRequest.of((int) (page - 1), size.intValue());
//
//        if (type == null || type.isEmpty() || "all".equals(type)) {
//            return searchAll(keyword, pageable);
//        } else if ("post".equals(type)) {
//            return searchPosts(keyword, pageable);
//        } else if ("moment".equals(type)) {
//            return searchMoments(keyword, pageable);
//        } else if ("comment".equals(type)) {
//            return searchComments(keyword, pageable);
//        }
//
//        return new PageResult<>(List.of(), 0L, size, page);
//    }
//
//    private PageResult<SearchVO> searchAll(String keyword, Pageable pageable) {
//        PageResult<SearchVO> postResults = searchPosts(keyword, pageable);
//        PageResult<SearchVO> momentResults = searchMoments(keyword, pageable);
//        PageResult<SearchVO> commentResults = searchComments(keyword, pageable);
//
//        // 合并结果（简化处理，实际应该合并分页结果）
//        List<SearchVO> allResults = new java.util.ArrayList<>();
//        allResults.addAll(postResults.getRecords());
//        allResults.addAll(momentResults.getRecords());
//        allResults.addAll(commentResults.getRecords());
//
//        long total = postResults.getTotal() + momentResults.getTotal() + commentResults.getTotal();
//
//        return new PageResult<>(allResults, total, pageable.getPageSize(), pageable.getPageNumber() + 1);
//    }
//
//    private PageResult<SearchVO> searchPosts(String keyword, Pageable pageable) {
//        Query query = Query.of(q -> q
//                .multiMatch(m -> m
//                        .query(keyword)
//                        .fields("title", "content", "excerpt")
//                        .type(TextQueryType.BestFields)
//                )
//        );
//
//        NativeSearchQuery nativeQuery = NativeSearchQuery.builder()
//                .withQuery(query)
//                .withHighlightFields(
//                        new org.springframework.data.elasticsearch.core.query.highlight.HighlightField("title"),
//                        new org.springframework.data.elasticsearch.core.query.highlight.HighlightField("content")
//                )
//                .withPageable(pageable)
//                .build();
//
//        SearchHits<PostDocument> searchHits = elasticsearchOperations.search(nativeQuery, PostDocument.class);
//
//        List<SearchVO> voList = searchHits.getSearchHits().stream()
//                .map(this::convertPostToVO)
//                .collect(Collectors.toList());
//
//        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
//    }
//
//    private PageResult<SearchVO> searchMoments(String keyword, Pageable pageable) {
//        Query query = Query.of(q -> q
//                .multiMatch(m -> m
//                        .query(keyword)
//                        .fields("content")
//                        .type(TextQueryType.BestFields)
//                )
//        );
//
//        NativeQuery nativeQuery = NativeQuery.builder()
//                .withQuery(query)
//                .withHighlightFields(
//                        new org.springframework.data.elasticsearch.core.query.highlight.HighlightField("content")
//                )
//                .withPageable(pageable)
//                .build();
//
//        SearchHits<MomentDocument> searchHits = elasticsearchOperations.search(nativeQuery, MomentDocument.class);
//
//        List<SearchVO> voList = searchHits.getSearchHits().stream()
//                .map(this::convertMomentToVO)
//                .collect(Collectors.toList());
//
//        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
//    }
//
//    private PageResult<SearchVO> searchComments(String keyword, Pageable pageable) {
//        Query query = Query.of(q -> q
//                .multiMatch(m -> m
//                        .query(keyword)
//                        .fields("content")
//                        .type(TextQueryType.BestFields)
//                )
//        );
//
//        NativeQuery nativeQuery = NativeQuery.builder()
//                .withQuery(query)
//                .withHighlightFields(
//                        new org.springframework.data.elasticsearch.core.query.highlight.HighlightField("content")
//                )
//                .withPageable(pageable)
//                .build();
//
//        SearchHits<CommentDocument> searchHits = elasticsearchOperations.search(nativeQuery, CommentDocument.class);
//
//        List<SearchVO> voList = searchHits.getSearchHits().stream()
//                .map(this::convertCommentToVO)
//                .collect(Collectors.toList());
//
//        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
//    }
//
//    private SearchVO convertPostToVO(SearchHit<PostDocument> hit) {
//        PostDocument doc = hit.getContent();
//        SearchVO vo = new SearchVO();
//        vo.setType("post");
//        vo.setId(doc.getId());
//        vo.setTitle(doc.getTitle());
//        vo.setContent(doc.getContent());
//        vo.setExcerpt(doc.getExcerpt());
//        vo.setHighlights(hit.getHighlightFields());
//        vo.setAuthorId(doc.getAuthorId());
//        vo.setCategoryId(doc.getCategoryId());
//        vo.setTagIds(doc.getTagIds());
//        vo.setViewCount(doc.getViewCount());
//        vo.setLikeCount(doc.getLikeCount());
//        vo.setCommentCount(doc.getCommentCount());
//        if (doc.getCreateTime() != null) {
//            vo.setCreateTime(doc.getCreateTime().toString());
//        }
//
//        if (doc.getAuthorId() != null) {
//            User user = userMapper.selectById(doc.getAuthorId());
//            if (user != null) {
//                vo.setAuthorName(user.getNickname());
//            }
//        }
//        if (doc.getCategoryId() != null) {
//            Category category = categoryMapper.selectById(doc.getCategoryId());
//            if (category != null) {
//                vo.setCategoryName(category.getName());
//            }
//        }
//        if (doc.getTagIds() != null && !doc.getTagIds().isEmpty()) {
//            List<String> tagNames = doc.getTagIds().stream()
//                    .map(tagId -> {
//                        Tag tag = tagMapper.selectById(tagId);
//                        return tag != null ? tag.getName() : null;
//                    })
//                    .filter(name -> name != null)
//                    .collect(Collectors.toList());
//            vo.setTagNames(tagNames);
//        }
//
//        return vo;
//    }
//
//    private SearchVO convertMomentToVO(SearchHit<MomentDocument> hit) {
//        MomentDocument doc = hit.getContent();
//        SearchVO vo = new SearchVO();
//        vo.setType("moment");
//        vo.setId(doc.getId());
//        vo.setContent(doc.getContent());
//        vo.setHighlights(hit.getHighlightFields());
//        vo.setAuthorId(doc.getAuthorId());
//        vo.setLikeCount(doc.getLikeCount());
//        vo.setCommentCount(doc.getCommentCount());
//        if (doc.getCreateTime() != null) {
//            vo.setCreateTime(doc.getCreateTime().toString());
//        }
//
//        if (doc.getAuthorId() != null) {
//            User user = userMapper.selectById(doc.getAuthorId());
//            if (user != null) {
//                vo.setAuthorName(user.getNickname());
//            }
//        }
//
//        return vo;
//    }
//
//    private SearchVO convertCommentToVO(SearchHit<CommentDocument> hit) {
//        CommentDocument doc = hit.getContent();
//        SearchVO vo = new SearchVO();
//        vo.setType("comment");
//        vo.setId(doc.getId());
//        vo.setContent(doc.getContent());
//        vo.setHighlights(hit.getHighlightFields());
//        vo.setTargetId(doc.getTargetId());
//        vo.setTargetType(doc.getTargetType());
//        vo.setUserId(doc.getUserId());
//        if (doc.getCreateTime() != null) {
//            vo.setCreateTime(doc.getCreateTime().toString());
//        }
//
//        if (doc.getUserId() != null) {
//            User user = userMapper.selectById(doc.getUserId());
//            if (user != null) {
//                vo.setAuthorName(user.getNickname());
//            }
//        }
//
//        return vo;
//    }
//
//    @Override
//    public void indexDocument(String indexType, Long id, String document) throws Exception {
//        if (!isEnabled()) {
//            return;
//        }
//
//        // Elasticsearch 的索引操作通过 Repository 完成，这里提供接口但具体实现由 SearchSyncService 处理
//        // 这个方法主要用于其他搜索引擎插件的实现
//    }
//
//    @Override
//    public void deleteDocument(String indexType, Long id) throws Exception {
//        if (!isEnabled()) {
//            return;
//        }
//
//        switch (indexType) {
//            case "post":
//                postDocumentRepository.deleteById(id);
//                break;
//            case "moment":
//                momentDocumentRepository.deleteById(id);
//                break;
//            case "comment":
//                commentDocumentRepository.deleteById(id);
//                break;
//        }
//    }
//
//    @Override
//    public void bulkIndexDocuments(String indexType, List<Map<String, Object>> documents) throws Exception {
//        if (!isEnabled()) {
//            return;
//        }
//
//        // 批量索引操作通过 Repository 完成，这里提供接口但具体实现由 SearchSyncService 处理
//    }
//}
//
