package com.blog.modules.talk.service.impl;


import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.talk.model.enums.TalkStatus;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.talk.model.vo.MomentStatsVO;
import com.blog.modules.talk.model.vo.TalkVO;
import com.blog.modules.talk.service.TalkPublicService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class TalkPublicServiceImpl implements TalkPublicService {
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Cacheable(value = "talk:list", key = "#page + ':' + #size")
    public PageResult<TalkVO> list(Long page, Long size) {
        Page<Talk> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Talk> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Talk::getStatus, TalkStatus.PUBLISHED.getCode());
        wrapper.orderByDesc(Talk::getIsTop);
        wrapper.orderByDesc(Talk::getCreateTime);

        Page<Talk> result = talkMapper.selectPage(pageParam, wrapper);
        List<TalkVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public TalkVO getById(Long id) {
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .eq(Talk::getId, id)
                .eq(Talk::getStatus, TalkStatus.PUBLISHED.getCode()));
        if (talk == null) {
            return null;
        }
        return convertToVO(talk);
    }

    @Override
    public TalkVO getByKey(String key) {
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .eq(Talk::getTalkKey, key)
                .eq(Talk::getStatus, TalkStatus.PUBLISHED.getCode()));
        if (talk == null) {
            return null;
        }
        return convertToVO(talk);
    }

    private TalkVO convertToVO(Talk talk) {
        TalkVO vo = BeanUtil.copyProperties(talk, TalkVO.class);
        // 说说为博主所发，公开列表不暴露完整 IP/经纬度（IP 属地仍保留供前台展示）
        vo.setIp(null);
        vo.setLatitude(null);
        vo.setLongitude(null);
        if (talk.getAuthorId() != null) {
            User user = userMapper.selectById(talk.getAuthorId());
            if (user != null) {
                vo.setAuthorName(user.getNickname());
            }
        }
        if (talk.getImages() != null && !talk.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(talk.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(List.of());
            }
        }
        return vo;
    }

    @Override
    public List<MomentStatsVO> getStatsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<Talk> talks = talkMapper.selectList(new LambdaQueryWrapper<Talk>()
                .select(Talk::getId, Talk::getViewCount, Talk::getLikeCount, Talk::getCommentCount)
                .in(Talk::getId, ids)
                .eq(Talk::getDeleted, 0)
                .eq(Talk::getStatus, TalkStatus.PUBLISHED.getCode()));
        return talks.stream().map(this::toStatsVO).collect(Collectors.toList());
    }

    @Override
    public MomentStatsVO getTalkStats(Long id) {
        if (id == null || id <= 0) {
            return null;
        }
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .select(Talk::getId, Talk::getViewCount, Talk::getLikeCount, Talk::getCommentCount)
                .eq(Talk::getId, id)
                .eq(Talk::getDeleted, 0)
                .eq(Talk::getStatus, TalkStatus.PUBLISHED.getCode())
                .last("LIMIT 1"));
        return talk == null ? null : toStatsVO(talk);
    }

    private MomentStatsVO toStatsVO(Talk talk) {
        MomentStatsVO vo = new MomentStatsVO();
        vo.setId(talk.getId());
        vo.setViewCount(talk.getViewCount() != null ? talk.getViewCount() : 0);
        vo.setLikeCount(talk.getLikeCount() != null ? talk.getLikeCount() : 0);
        vo.setCommentCount(talk.getCommentCount() != null ? talk.getCommentCount() : 0);
        return vo;
    }
}
