package com.blog.modules.comment.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.comment.model.enums.TargetType;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.model.dto.CommentQueryDTO;
import com.blog.modules.comment.service.CommentQueryService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CommentQueryServiceImpl implements CommentQueryService {
    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Override
    public PageResult<CommentVO> list(CommentQueryDTO queryDTO) {
        Page<Comment> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getStatus() != null) {
            wrapper.eq(Comment::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getTargetId() != null) {
            wrapper.eq(Comment::getTargetId, queryDTO.getTargetId());
        }
        if (queryDTO.getTargetType() != null) {
            wrapper.eq(Comment::getTargetType, queryDTO.getTargetType());
        }
        if (queryDTO.getId() != null) {
            wrapper.eq(Comment::getId, queryDTO.getId());
        }
        if (queryDTO.getParentId() != null) {
            wrapper.eq(Comment::getParentId, queryDTO.getParentId());
        }
        if (queryDTO.getRootId() != null) {
            wrapper.eq(Comment::getRootId, queryDTO.getRootId());
        }
        if (queryDTO.getIsVisible() != null) {
            wrapper.eq(Comment::getIsVisible, queryDTO.getIsVisible());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            wrapper.and(w -> w.like(Comment::getContent, queryDTO.getKeyword())
                    .or()
                    .like(Comment::getNickname, queryDTO.getKeyword())
                    .or()
                    .like(Comment::getEmail, queryDTO.getKeyword()));
        }
        if (queryDTO.getCountry() != null && !queryDTO.getCountry().trim().isEmpty()) {
            wrapper.eq(Comment::getCountry, queryDTO.getCountry());
        }
        if (queryDTO.getProvince() != null && !queryDTO.getProvince().trim().isEmpty()) {
            wrapper.eq(Comment::getProvince, queryDTO.getProvince());
        }
        if (queryDTO.getCity() != null && !queryDTO.getCity().trim().isEmpty()) {
            wrapper.eq(Comment::getCity, queryDTO.getCity());
        }
        if (queryDTO.getLocation() != null && !queryDTO.getLocation().trim().isEmpty()) {
            wrapper.like(Comment::getLocation, queryDTO.getLocation());
        }
        wrapper.orderByDesc(Comment::getCreateTime);

        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<Comment> records = result.getRecords();

        Map<Long, User> userMap = Map.of();
        List<Long> userIds = records.stream()
                .map(Comment::getUserId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (!userIds.isEmpty()) {
            userMap = userMapper.selectBatchIds(userIds).stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
        }

        Map<Long, Integer> replyCountMap = Map.of();
        List<Long> commentIds = records.stream()
                .map(Comment::getId)
                .collect(Collectors.toList());
        if (!commentIds.isEmpty()) {
            QueryWrapper<Comment> countWrapper = new QueryWrapper<>();
            countWrapper.select("parent_id", "COUNT(*) AS cnt");
            countWrapper.in("parent_id", commentIds);
            countWrapper.eq("status", 1);
            countWrapper.eq("is_visible", 1);
            countWrapper.groupBy("parent_id");
            List<Map<String, Object>> rows = commentMapper.selectMaps(countWrapper);
            Map<Long, Integer> counts = new HashMap<>();
            for (Map<String, Object> row : rows) {
                Object parentIdObj = row.get("parent_id");
                Object cntObj = row.get("cnt");
                if (parentIdObj instanceof Number) {
                    long parentId = ((Number) parentIdObj).longValue();
                    int cnt = cntObj instanceof Number ? ((Number) cntObj).intValue() : 0;
                    counts.put(parentId, cnt);
                }
            }
            replyCountMap = counts;
        }

        Map<Long, String> articleTitleMap = Map.of();
        Map<Long, String> talkTitleMap = Map.of();
        List<Long> articleIds = records.stream()
                .filter(c -> TargetType.fromCode(c.getTargetType()) == TargetType.ARTICLE)
                .map(Comment::getTargetId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (!articleIds.isEmpty() && articleMapper != null) {
            articleTitleMap = articleMapper.selectBatchIds(articleIds).stream()
                    .collect(Collectors.toMap(Article::getId, Article::getTitle));
        }
        List<Long> talkIds = records.stream()
                .filter(c -> TargetType.fromCode(c.getTargetType()) == TargetType.TALK)
                .map(Comment::getTargetId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (!talkIds.isEmpty() && talkMapper != null) {
            Map<Long, String> titles = new HashMap<>();
            List<Talk> talks = talkMapper.selectBatchIds(talkIds);
            for (Talk talk : talks) {
                String content = talk.getContent();
                if (content != null && !content.isEmpty()) {
                    String plainText = content.replaceAll("<[^>]*>", "").trim();
                    String preview = plainText.length() > 30
                            ? plainText.substring(0, 30) + "..."
                            : plainText;
                    titles.put(talk.getId(), preview);
                } else {
                    titles.put(talk.getId(), "(空说说)");
                }
            }
            talkTitleMap = titles;
        }

        List<CommentVO> voList = records.stream()
                .map(comment -> convertToVO(comment, userMap, replyCountMap, articleTitleMap, talkTitleMap))
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public CommentVO getById(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return null;
        }
        return convertToVO(comment);
    }

    private CommentVO convertToVO(Comment comment) {
        return convertToVO(comment, null, null, null, null);
    }

    private CommentVO convertToVO(
            Comment comment,
            Map<Long, User> userMap,
            Map<Long, Integer> replyCountMap,
            Map<Long, String> articleTitleMap,
            Map<Long, String> talkTitleMap
    ) {
        CommentVO vo = BeanUtil.copyProperties(comment, CommentVO.class);
        if (comment.getUserId() != null) {
            User user = userMap != null ? userMap.get(comment.getUserId()) : null;
            if (user == null) {
                user = userMapper.selectById(comment.getUserId());
            }
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getAvatar());
            }
        }
        if (comment.getImages() != null && !comment.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(comment.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(new ArrayList<>());
            }
        }
        // 设置目标对象标题
        if (comment.getTargetId() != null) {
            TargetType targetType = TargetType.fromCode(comment.getTargetType());
            if (targetType == TargetType.ARTICLE && articleMapper != null) {
                if (articleTitleMap != null && articleTitleMap.containsKey(comment.getTargetId())) {
                    vo.setTargetTitle(articleTitleMap.get(comment.getTargetId()));
                } else {
                    Article article = articleMapper.selectById(comment.getTargetId());
                    if (article != null) {
                        vo.setTargetTitle(article.getTitle());
                    }
                }
            } else if (targetType == TargetType.TALK && talkMapper != null) {
                if (talkTitleMap != null && talkTitleMap.containsKey(comment.getTargetId())) {
                    vo.setTargetTitle(talkTitleMap.get(comment.getTargetId()));
                } else {
                    Talk talk = talkMapper.selectById(comment.getTargetId());
                    if (talk != null) {
                        // 说说取内容的前30个字符作为标题
                        String content = talk.getContent();
                        if (content != null && !content.isEmpty()) {
                            // 移除HTML标签（如果有的话）
                            String plainText = content.replaceAll("<[^>]*>", "").trim();
                            String preview = plainText.length() > 30
                                ? plainText.substring(0, 30) + "..."
                                : plainText;
                            vo.setTargetTitle(preview);
                        } else {
                            vo.setTargetTitle("(空说说)");
                        }
                    }
                }
            }
        }
        vo.setIsOwner(false);
        // 查询回复数量
        if (replyCountMap != null && replyCountMap.containsKey(comment.getId())) {
            vo.setReplyCount(replyCountMap.get(comment.getId()));
        } else {
            int replyCount = commentMapper.countReplies(comment.getId());
            vo.setReplyCount(replyCount);
        }
        return vo;
    }
}
