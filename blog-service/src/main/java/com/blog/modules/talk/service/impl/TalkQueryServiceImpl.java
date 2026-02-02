package com.blog.modules.talk.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.dto.TalkQueryDTO;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.talk.model.vo.TalkVO;
import com.blog.modules.file.model.vo.FileVO;
import com.blog.modules.talk.service.TalkQueryService;
import com.blog.modules.file.service.FileService;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class TalkQueryServiceImpl implements TalkQueryService {
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FileService fileService;

    @Override
    public PageResult<TalkVO> list(TalkQueryDTO queryDTO) {
        Page<Talk> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<Talk> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getId() != null) {
            wrapper.eq(Talk::getId, queryDTO.getId());
        }
        if (queryDTO.getTalkKey() != null && !queryDTO.getTalkKey().trim().isEmpty()) {
            wrapper.eq(Talk::getTalkKey, queryDTO.getTalkKey().trim());
        }
        if (queryDTO.getStatus() != null && !queryDTO.getStatus().trim().isEmpty()) {
            wrapper.eq(Talk::getStatus, queryDTO.getStatus().trim());
        }
        if (queryDTO.getIsTop() != null) {
            wrapper.eq(Talk::getIsTop, queryDTO.getIsTop());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            wrapper.like(Talk::getContent, queryDTO.getKeyword().trim());
        }
        wrapper.orderByDesc(Talk::getIsTop);
        wrapper.orderByDesc(Talk::getCreateTime);

        Page<Talk> result = talkMapper.selectPage(pageParam, wrapper);

        List<TalkVO> voList = result.getRecords().stream()
                .map(talk -> convertToVO(talk, List.of()))
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public TalkVO getById(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            return null;
        }
        return convertToVO(talk, null);
    }

    private TalkVO convertToVO(Talk talk, List<FileVO> referencedFiles) {
        TalkVO vo = BeanUtil.copyProperties(talk, TalkVO.class);
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

        // 如果提供了文件列表则使用，否则查询
        if (referencedFiles == null) {
            referencedFiles = fileService.listByReference("TALK", talk.getId());
        }
        vo.setReferencedFiles(referencedFiles);

        return vo;
    }
}
