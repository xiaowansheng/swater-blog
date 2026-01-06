package com.blog.modules.comment.service.impl;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicService;
import com.blog.plugin.components.comment.CommentProviderFactory;
import com.blog.plugin.components.comment.CommentProviderPlugin;
import com.blog.modules.comment.event.CommentCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class CommentPublicServiceImpl implements CommentPublicService {
    @Autowired(required = false)
    private CommentProviderFactory commentProviderFactory;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public CommentVO create(CommentDTO dto) {
        if (commentProviderFactory == null) {
            throw new BusinessException("未配置评论插件工厂");
        }
        CommentProviderPlugin provider = commentProviderFactory.getActiveProvider();
        if (provider == null) {
            throw new BusinessException("没有可用的评论插件");
        }

        CommentVO vo;
        try {
            vo = provider.createComment(dto);
        } catch (Exception e) {
            throw new BusinessException("评论创建失败: " + e.getMessage());
        }

        Long commentId = vo != null ? vo.getId() : null;
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentCreatedEvent(this, commentId, null)));
        return vo;
    }

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

    private void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
        } else {
            runnable.run();
        }
    }
}

