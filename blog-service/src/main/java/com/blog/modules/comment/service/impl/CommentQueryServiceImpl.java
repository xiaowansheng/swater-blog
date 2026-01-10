package com.blog.modules.comment.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
import java.util.List;
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
        wrapper.orderByDesc(Comment::getCreateTime);

        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<CommentVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
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
        CommentVO vo = BeanUtil.copyProperties(comment, CommentVO.class);
        if (comment.getUserId() != null) {
            User user = userMapper.selectById(comment.getUserId());
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
                Article article = articleMapper.selectById(comment.getTargetId());
                if (article != null) {
                    vo.setTargetTitle(article.getTitle());
                }
            } else if (targetType == TargetType.TALK && talkMapper != null) {
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
        vo.setIsOwner(false);
        // 查询回复数量
        int replyCount = commentMapper.countReplies(comment.getId());
        vo.setReplyCount(replyCount);
        return vo;
    }
}
