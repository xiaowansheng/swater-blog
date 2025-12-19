package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.TagMapper;
import com.blog.model.dto.TagDTO;
import com.blog.model.entity.Tag;
import com.blog.model.vo.TagVO;
import com.blog.service.TagService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TagServiceImpl implements TagService {
    @Autowired
    private TagMapper tagMapper;

    @Override
    public List<TagVO> list() {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getDeleted, 0);
        List<Tag> tags = tagMapper.selectList(wrapper);
        return BeanUtil.copyList(tags, TagVO.class);
    }

    @Override
    public List<TagVO> listPublic() {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getDeleted, 0);
        wrapper.eq(Tag::getStatus, "1");
        List<Tag> tags = tagMapper.selectList(wrapper);
        return BeanUtil.copyList(tags, TagVO.class);
    }

    @Override
    public TagVO getById(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(tag, TagVO.class);
    }

    @Override
    @Transactional
    public Long create(TagDTO dto) {
        Tag tag = BeanUtil.copyProperties(dto, Tag.class);
        tag.setTagKey(KeyUtil.generateKey("tag"));
        if (dto.getStatus() == null) {
            tag.setStatus("1");
        }
        tagMapper.insert(tag);
        return tag.getId();
    }

    @Override
    @Transactional
    public void update(Long id, TagDTO dto) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getDeleted() == 1) {
            throw new BusinessException("标签不存在");
        }
        tag.setName(dto.getName());
        tag.setSlug(dto.getSlug());
        tag.setColor(dto.getColor());
        tag.setDescription(dto.getDescription());
        tag.setStatus(dto.getStatus());
        tagMapper.updateById(tag);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null || tag.getDeleted() == 1) {
            throw new BusinessException("标签不存在");
        }
        tagMapper.deleteById(id);
    }
}

