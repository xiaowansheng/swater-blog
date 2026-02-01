package com.blog.modules.tag.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.tag.model.dto.TagDTO;
import com.blog.modules.tag.model.entity.Tag;
import com.blog.modules.tag.model.enums.TagStatus;
import com.blog.modules.tag.model.vo.TagVO;
import com.blog.modules.tag.service.TagService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.infrastructure.revalidate.RevalidateClient;
import com.blog.infrastructure.revalidate.RevalidateTags;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
@Service
public class TagServiceImpl implements TagService {
    @Autowired
    private TagMapper tagMapper;

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

    @Override
    public List<TagVO> list() {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        List<Tag> tags = tagMapper.selectList(wrapper);
        return BeanUtil.copyList(tags, TagVO.class);
    }

    @Override
    public List<TagVO> listPublic() {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getStatus, TagStatus.PUBLISHED.getCode());
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
            tag.setStatus(TagStatus.PUBLISHED.getCode());
        }
        tagMapper.insert(tag);
        triggerRevalidate(tag);
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
        triggerRevalidate(tag);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException("标签不存在");
        }
        tagMapper.deleteById(id);
        triggerRevalidate(tag);
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

    private void triggerRevalidate(Tag tag) {
        if (revalidateClient == null) {
            return;
        }
        EventUtil.publishEventAfterCommit(() -> {
            List<String> tags = new ArrayList<>(RevalidateTags.TAG_LIST);
            if (tag != null) {
                if (tag.getId() != null) {
                    tags.add("tag:detail:id:" + tag.getId());
                }
                if (tag.getTagKey() != null && !tag.getTagKey().isBlank()) {
                    tags.add("tag:detail:key:" + tag.getTagKey());
                }
            }
            revalidateClient.revalidateTags(tags);
        });
    }
}

