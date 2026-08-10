package com.blog.plugin.components.search.impl;



import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.search.model.vo.SearchVO;
import com.blog.plugin.components.search.SearchPlugin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Component
@ConditionalOnProperty(name = "plugin.search.active", havingValue = "database", matchIfMissing = false)
public class DatabaseSearchPlugin implements SearchPlugin {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public String getName() {
        return "database";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        return search(keyword, type, page, size, null);
    }

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size, Long categoryId) {
        if (type == null || type.isEmpty() || "all".equals(type)) {
            return searchAll(keyword, page, size, categoryId);
        } else if ("post".equals(type)) {
            return searchPosts(keyword, page, size, categoryId);
        } else if ("moment".equals(type)) {
            return searchMoments(keyword, page, size);
        } else if ("comment".equals(type)) {
            return searchComments(keyword, page, size);
        }
        return new PageResult<>(new ArrayList<>(), 0L, size, page);
    }

    @Override
    public Map<String, Long> getFacetCounts(String keyword) {
        Map<String, Long> facets = new java.util.LinkedHashMap<>();
        facets.put("post", articleMapper.selectCount(buildPostWrapper(keyword, null)));
        LambdaQueryWrapper<Talk> talkWrapper = new LambdaQueryWrapper<>();
        talkWrapper.like(Talk::getContent, keyword);
        facets.put("moment", talkMapper.selectCount(talkWrapper));
        facets.put("comment", commentMapper.selectCount(new LambdaQueryWrapper<Comment>()
                .like(Comment::getContent, keyword)
                .eq(Comment::getDeleted, 0)));
        return facets;
    }

    private LambdaQueryWrapper<Article> buildPostWrapper(String keyword, Long categoryId) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.like(Article::getTitle, keyword)
                .or().like(Article::getContent, keyword)
                .or().like(Article::getExcerpt, keyword));
        wrapper.eq(Article::getDeleted, 0);
        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }
        return wrapper;
    }

    private PageResult<SearchVO> searchAll(String keyword, Long page, Long size, Long categoryId) {
        PageResult<SearchVO> postResults = searchPosts(keyword, page, size, categoryId);
        PageResult<SearchVO> momentResults = searchMoments(keyword, page, size);
        PageResult<SearchVO> commentResults = searchComments(keyword, page, size);

        List<SearchVO> allResults = new ArrayList<>();
        allResults.addAll(postResults.getRecords());
        allResults.addAll(momentResults.getRecords());
        allResults.addAll(commentResults.getRecords());
        long total = postResults.getTotal() + momentResults.getTotal() + commentResults.getTotal();

        return new PageResult<>(allResults, total, size, page);
    }

    private PageResult<SearchVO> searchPosts(String keyword, Long page, Long size, Long categoryId) {
        LambdaQueryWrapper<Article> wrapper = buildPostWrapper(keyword, categoryId);
        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> pageObj = new Page<>(page, size);
        Page<Article> result = articleMapper.selectPage(pageObj, wrapper);

        List<SearchVO> voList = result.getRecords().stream()
                .map(article -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("post");
                    vo.setId(article.getId());
                    vo.setArticleKey(article.getArticleKey());
                    vo.setTitle(article.getTitle());
                    vo.setContent(article.getContent());
                    vo.setExcerpt(article.getExcerpt());
                    if (article.getCreateTime() != null) {
                        vo.setCreateTime(article.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    private PageResult<SearchVO> searchMoments(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Talk> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(Talk::getContent, keyword);
        wrapper.orderByDesc(Talk::getCreateTime);

        Page<Talk> pageObj = new Page<>(page, size);
        Page<Talk> result = talkMapper.selectPage(pageObj, wrapper);

        List<SearchVO> voList = result.getRecords().stream()
                .map(talk -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("moment");
                    vo.setId(talk.getId());
                    vo.setContent(talk.getContent());
                    // 使用articleKey字段存储talkKey，前端会使用这个字段来跳转
                    vo.setArticleKey(talk.getTalkKey());
                    if (talk.getCreateTime() != null) {
                        vo.setCreateTime(talk.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    private PageResult<SearchVO> searchComments(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(Comment::getContent, keyword);
        wrapper.eq(Comment::getDeleted, 0);
        wrapper.orderByDesc(Comment::getCreateTime);

        Page<Comment> pageObj = new Page<>(page, size);
        Page<Comment> result = commentMapper.selectPage(pageObj, wrapper);

        List<Comment> comments = result.getRecords();
        // 批量预取目标对象，避免逐条 selectById 造成 N+1 查询
        List<Long> articleTargetIds = new ArrayList<>();
        List<Long> talkTargetIds = new ArrayList<>();
        for (Comment comment : comments) {
            if (comment.getTargetType() == null || comment.getTargetId() == null) {
                continue;
            }
            String targetType = comment.getTargetType().toLowerCase();
            if (targetType.contains("article") || targetType.contains("post")) {
                articleTargetIds.add(comment.getTargetId());
            } else if (targetType.contains("moment") || targetType.contains("talk")) {
                talkTargetIds.add(comment.getTargetId());
            }
        }
        Map<Long, String> articleKeyMap = articleTargetIds.isEmpty() ? java.util.Collections.emptyMap() :
                articleMapper.selectBatchIds(articleTargetIds).stream()
                        .filter(a -> a.getArticleKey() != null)
                        .collect(Collectors.toMap(Article::getId, Article::getArticleKey));
        Map<Long, String> talkKeyMap = talkTargetIds.isEmpty() ? java.util.Collections.emptyMap() :
                talkMapper.selectBatchIds(talkTargetIds).stream()
                        .filter(t -> t.getTalkKey() != null)
                        .collect(Collectors.toMap(Talk::getId, Talk::getTalkKey));

        List<SearchVO> voList = comments.stream()
                .map(comment -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("comment");
                    vo.setId(comment.getId());
                    vo.setContent(comment.getContent());
                    vo.setTitle("评论");
                    vo.setTargetId(comment.getTargetId());
                    vo.setTargetType(comment.getTargetType());

                    // 从批量预取的映射中查目标 key
                    if (comment.getTargetType() != null) {
                        String targetType = comment.getTargetType().toLowerCase();

                        if (targetType.contains("article") || targetType.contains("post")) {
                            vo.setArticleKey(articleKeyMap.get(comment.getTargetId()));
                        } else if (targetType.contains("moment") || targetType.contains("talk")) {
                            vo.setArticleKey(talkKeyMap.get(comment.getTargetId()));
                        }
                    }

                    if (comment.getCreateTime() != null) {
                        vo.setCreateTime(comment.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    @Override
    public void indexDocument(String indexType, Long id, String document) throws Exception {
    }

    @Override
    public void deleteDocument(String indexType, Long id) throws Exception {
    }

    @Override
    public void bulkIndexDocuments(String indexType, List<Map<String, Object>> documents) throws Exception {
    }
}
