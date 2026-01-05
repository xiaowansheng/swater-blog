package com.blog.modules.comment.service.impl;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicQueryService;
import com.blog.plugin.components.comment.CommentProviderFactory;
import com.blog.plugin.components.comment.CommentProviderPlugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentPublicQueryServiceImpl implements CommentPublicQueryService {
    @Autowired(required = false)
    private CommentProviderFactory commentProviderFactory;

    @Override
    public PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size) {
        CommentProviderPlugin provider = getProvider();
        try {
            return provider.getComments(targetId, targetType, page, size);
        } catch (Exception e) {
            throw new BusinessException("获取评论失败: " + e.getMessage());
        }
    }

    private CommentProviderPlugin getProvider() {
        if (commentProviderFactory == null) {
            throw new BusinessException("未配置评论插件工厂");
        }
        CommentProviderPlugin provider = commentProviderFactory.getActiveProvider();
        if (provider == null) {
            throw new BusinessException("没有可用的评论插件");
        }
        return provider;
    }
}

