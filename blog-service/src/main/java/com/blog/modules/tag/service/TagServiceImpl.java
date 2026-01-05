package com.blog.modules.tag.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.common.exception.BusinessException;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.tag.model.dto.TagDTO;
import com.blog.modules.tag.model.entity.Tag;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.tag.service.TagService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.KeyUtil;
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
        List<Tag> tags = tagMapper.selectList(wrapper);
        return BeanUtil.copyList(tags, TagVO.class);
    }

    @Override
    public List<TagVO> listPublic() {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getStatus, "1");
        List<Tag> tags = tagMapper.selectList(wrapper);
        return BeanUtil.copyList(tags, TagVO.class);
    }

    @Override
    public TagVO getById(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            return null;
        }
        return BeanUtil.copyProperties(tag, TagVO.class);
    }

    @Override
    public TagVO getByKey(String key) {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getTagKey, key);
        Tag tag = tagMapper.selectOne(wrapper);
        if (tag == null) {
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
        if (tag == null) {
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
        if (tag == null) {
            throw new BusinessException("标签不存在");
        }
        tagMapper.deleteById(id);
    }

    @Override
    @Transactional
    public Long findOrCreateByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getName, name.trim());
        Tag tag = tagMapper.selectOne(wrapper);
        if (tag != null) {
            return tag.getId();
        }
        
        TagDTO dto = new TagDTO();
        dto.setName(name.trim());
        dto.setSlug(name.trim().toLowerCase().replaceAll("\\s+", "-"));
        return create(dto);
    }
}

