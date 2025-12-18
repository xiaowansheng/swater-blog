package com.blog.service.impl;

import com.blog.common.PageResult;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.ArticleTagMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TagMapper;
import com.blog.mapper.TalkMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.document.CommentDocument;
import com.blog.model.document.MomentDocument;
import com.blog.model.document.PostDocument;
import com.blog.model.entity.Article;
import com.blog.model.entity.Category;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Tag;
import com.blog.model.entity.Talk;
import com.blog.model.entity.User;
import com.blog.model.vo.SearchVO;
import com.blog.repository.CommentDocumentRepository;
import com.blog.repository.MomentDocumentRepository;
import com.blog.repository.PostDocumentRepository;
import com.blog.service.SearchService;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    @Autowired
    private PostDocumentRepository postDocumentRepository;

    @Autowired
    private MomentDocumentRepository momentDocumentRepository;

    @Autowired
    private CommentDocumentRepository commentDocumentRepository;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        Pageable pageable = PageRequest.of((int) (page - 1), size.intValue());

        if (type == null || type.isEmpty() || "all".equals(type)) {
            return searchAll(keyword, pageable);
        } else if ("post".equals(type)) {
            return searchPosts(keyword, pageable);
        } else if ("moment".equals(type)) {
            return searchMoments(keyword, pageable);
        } else if ("comment".equals(type)) {
            return searchComments(keyword, pageable);
        }

        return new PageResult<>(List.of(), 0L, size, page);
    }

    private PageResult<SearchVO> searchAll(String keyword, Pageable pageable) {
        List<SearchVO> results = List.of();
        long total = 0;

        PageResult<SearchVO> postResults = searchPosts(keyword, pageable);
        PageResult<SearchVO> momentResults = searchMoments(keyword, pageable);
        PageResult<SearchVO> commentResults = searchComments(keyword, pageable);

        results = List.of();
        total = postResults.getTotal() + momentResults.getTotal() + commentResults.getTotal();

        return new PageResult<>(results, total, pageable.getPageSize(), pageable.getPageNumber() + 1);
    }

    private PageResult<SearchVO> searchPosts(String keyword, Pageable pageable) {
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

        MultiMatchQueryBuilder multiMatchQuery = QueryBuilders
                .multiMatchQuery(keyword, "title", "content", "excerpt")
                .type(MultiMatchQueryBuilder.Type.BEST_FIELDS);

        queryBuilder.withQuery(multiMatchQuery);

        HighlightBuilder.Field titleField = new HighlightBuilder.Field("title");
        HighlightBuilder.Field contentField = new HighlightBuilder.Field("content");
        queryBuilder.withHighlightFields(titleField, contentField);

        queryBuilder.withPageable(pageable);

        NativeSearchQuery query = queryBuilder.build();
        SearchHits<PostDocument> searchHits = elasticsearchOperations.search(query, PostDocument.class);

        List<SearchVO> voList = searchHits.getSearchHits().stream()
                .map(this::convertPostToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
    }

    private PageResult<SearchVO> searchMoments(String keyword, Pageable pageable) {
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

        MultiMatchQueryBuilder multiMatchQuery = QueryBuilders
                .multiMatchQuery(keyword, "content")
                .type(MultiMatchQueryBuilder.Type.BEST_FIELDS);

        queryBuilder.withQuery(multiMatchQuery);

        HighlightBuilder.Field contentField = new HighlightBuilder.Field("content");
        queryBuilder.withHighlightFields(contentField);

        queryBuilder.withPageable(pageable);

        NativeSearchQuery query = queryBuilder.build();
        SearchHits<MomentDocument> searchHits = elasticsearchOperations.search(query, MomentDocument.class);

        List<SearchVO> voList = searchHits.getSearchHits().stream()
                .map(this::convertMomentToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
    }

    private PageResult<SearchVO> searchComments(String keyword, Pageable pageable) {
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder();

        MultiMatchQueryBuilder multiMatchQuery = QueryBuilders
                .multiMatchQuery(keyword, "content")
                .type(MultiMatchQueryBuilder.Type.BEST_FIELDS);

        queryBuilder.withQuery(multiMatchQuery);

        HighlightBuilder.Field contentField = new HighlightBuilder.Field("content");
        queryBuilder.withHighlightFields(contentField);

        queryBuilder.withPageable(pageable);

        NativeSearchQuery query = queryBuilder.build();
        SearchHits<CommentDocument> searchHits = elasticsearchOperations.search(query, CommentDocument.class);

        List<SearchVO> voList = searchHits.getSearchHits().stream()
                .map(this::convertCommentToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, searchHits.getTotalHits(), pageable.getPageSize(), pageable.getPageNumber() + 1);
    }

    private SearchVO convertPostToVO(SearchHit<PostDocument> hit) {
        PostDocument doc = hit.getContent();
        SearchVO vo = new SearchVO();
        vo.setType("post");
        vo.setId(doc.getId());
        vo.setTitle(doc.getTitle());
        vo.setContent(doc.getContent());
        vo.setExcerpt(doc.getExcerpt());
        vo.setHighlights(hit.getHighlightFields());
        vo.setAuthorId(doc.getAuthorId());
        vo.setCategoryId(doc.getCategoryId());
        vo.setTagIds(doc.getTagIds());
        vo.setViewCount(doc.getViewCount());
        vo.setLikeCount(doc.getLikeCount());
        vo.setCommentCount(doc.getCommentCount());
        if (doc.getCreateTime() != null) {
            vo.setCreateTime(doc.getCreateTime().toString());
        }

        if (doc.getAuthorId() != null) {
            User user = userMapper.selectById(doc.getAuthorId());
            if (user != null) {
                vo.setAuthorName(user.getNickname());
            }
        }
        if (doc.getCategoryId() != null) {
            Category category = categoryMapper.selectById(doc.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }
        if (doc.getTagIds() != null && !doc.getTagIds().isEmpty()) {
            List<String> tagNames = doc.getTagIds().stream()
                    .map(tagId -> {
                        Tag tag = tagMapper.selectById(tagId);
                        return tag != null ? tag.getName() : null;
                    })
                    .filter(name -> name != null)
                    .collect(Collectors.toList());
            vo.setTagNames(tagNames);
        }

        return vo;
    }

    private SearchVO convertMomentToVO(SearchHit<MomentDocument> hit) {
        MomentDocument doc = hit.getContent();
        SearchVO vo = new SearchVO();
        vo.setType("moment");
        vo.setId(doc.getId());
        vo.setContent(doc.getContent());
        vo.setHighlights(hit.getHighlightFields());
        vo.setAuthorId(doc.getAuthorId());
        vo.setLikeCount(doc.getLikeCount());
        vo.setCommentCount(doc.getCommentCount());
        if (doc.getCreateTime() != null) {
            vo.setCreateTime(doc.getCreateTime().toString());
        }

        if (doc.getAuthorId() != null) {
            User user = userMapper.selectById(doc.getAuthorId());
            if (user != null) {
                vo.setAuthorName(user.getNickname());
            }
        }

        return vo;
    }

    private SearchVO convertCommentToVO(SearchHit<CommentDocument> hit) {
        CommentDocument doc = hit.getContent();
        SearchVO vo = new SearchVO();
        vo.setType("comment");
        vo.setId(doc.getId());
        vo.setContent(doc.getContent());
        vo.setHighlights(hit.getHighlightFields());
        vo.setPostId(doc.getPostId());
        vo.setMomentId(doc.getMomentId());
        vo.setUserId(doc.getUserId());
        if (doc.getCreateTime() != null) {
            vo.setCreateTime(doc.getCreateTime().toString());
        }

        if (doc.getUserId() != null) {
            User user = userMapper.selectById(doc.getUserId());
            if (user != null) {
                vo.setAuthorName(user.getNickname());
            }
        }

        return vo;
    }
}

