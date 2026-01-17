package com.blog.modules.talk.service.impl;



import com.blog.bootstrap.context.UserContext;
import com.blog.modules.talk.event.talk.*;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.dto.TalkDTO;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.talk.model.enums.TalkStatus;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.modules.talk.service.TalkCommandService;
import com.blog.modules.file.service.FileService;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.shared.util.RequestUtil;
import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.model.UserAgentInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
public class TalkCommandServiceImpl implements TalkCommandService {
    private final TalkMapper talkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private FileService fileService;

    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    public TalkCommandServiceImpl(TalkMapper talkMapper) {
        this.talkMapper = talkMapper;
    }

    @Override
    @Transactional
    public Long create(TalkDTO dto) {
        Talk talk = BeanUtil.copyProperties(dto, Talk.class);
        talk.setTalkKey(KeyUtil.generateKey("talk"));

        Long userId = UserContext.getCurrentUserId();
        talk.setAuthorId(userId);

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            talk.setImages(JsonUtil.toJson(dto.getImages()));
        }

        talk.setLikeCount(0);
        talk.setCommentCount(0);

        // 设置IP和位置信息
        String ip = RequestUtil.getClientIp();
        talk.setIp(ip);
        if (locationProviderFactory != null && ip != null) {
            try {
                List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
                LocationInfo locationInfo = null;
                for (LocationProviderPlugin locationProvider : providers) {
                    locationInfo = locationProvider.getLocationInfo(ip);
                    if (locationInfo != null) {
                        break;
                    }
                }
                if (locationInfo != null) {
                    talk.setCountry(locationInfo.getCountry());
                    talk.setProvince(locationInfo.getProvince());
                    talk.setCity(locationInfo.getCity());
                    talk.setLatitude(locationInfo.getLatitude());
                    talk.setLongitude(locationInfo.getLongitude());
                    talk.setLocation(locationInfo.getLocation());
                    if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                        talk.setIp(locationInfo.getIp());
                    } else {
                        talk.setIp(ip);
                    }
                    talk.setLocation(locationInfo.getLocation() != null ? locationInfo.getLocation() :
                            (locationInfo.getProvince() != null && locationInfo.getCity() != null ?
                                    locationInfo.getProvince() + locationInfo.getCity() : null));
                } else {
                    talk.setIp(ip);
                }
            } catch (Exception e) {
                log.warn("说说发布IP定位失败，IP: {}", ip, e);
                talk.setIp(ip);
            }
        } else {
            talk.setIp(ip);
        }

        // 设置设备和浏览器信息
        UserAgentInfo userAgentInfo = UserAgentUtil.parseFromRequest();
        talk.setDevice(userAgentInfo.getDeviceDescription());
        talk.setBrowser(userAgentInfo.getBrowserDescription());

        if (dto.getStatus() == null) {
            talk.setStatus(TalkStatus.PUBLISHED.getCode());
        }
        if (dto.getIsTop() == null) {
            talk.setIsTop(0);
        }

        talkMapper.insert(talk);

        // 处理文件引用关系：验证前端提交的引用列表
        if (dto.getReferencedFileIds() != null && !dto.getReferencedFileIds().isEmpty()) {
            List<Long> validFileIds = new ArrayList<>();
            for (Long fileId : dto.getReferencedFileIds()) {
                // 检查文件是否在说说内容或图片列表中使用
                if (isFileInTalk(fileId, dto.getContent(), dto.getImages())) {
                    validFileIds.add(fileId);
                }
            }
            // 只为在内容中找到的文件建立引用关系
            if (!validFileIds.isEmpty()) {
                fileService.addReferences(validFileIds, "TALK", talk.getId());
            }
        }

        Talk savedTalk = talkMapper.selectById(talk.getId());
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkCreatedEvent(this, talk.getId(), savedTalk)));
        
        return talk.getId();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void update(Long id, TalkDTO dto) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }

        // 获取旧的引用文件列表
        List<Long> oldFileIds = null;
        if (talk.getImages() != null && !talk.getImages().isEmpty()) {
            List<String> oldImages = JsonUtil.fromJson(talk.getImages(), List.class);
            if (oldImages != null && !oldImages.isEmpty()) {
                oldFileIds = oldImages.stream()
                    .map(url -> fileService.getFileIdByUrl(url))
                    .filter(fileId -> fileId != null)
                    .collect(Collectors.toList());
            }
        }

        talk.setContent(dto.getContent());
        talk.setStatus(dto.getStatus());
        talk.setIsTop(dto.getIsTop());

        if (dto.getImages() != null) {
            if (dto.getImages().isEmpty()) {
                talk.setImages(null);
            } else {
                talk.setImages(JsonUtil.toJson(dto.getImages()));
            }
        }

        talkMapper.updateById(talk);

        // 处理文件引用关系：验证前端提交的引用列表
        List<Long> validFileIds = new ArrayList<>();
        if (dto.getReferencedFileIds() != null && !dto.getReferencedFileIds().isEmpty()) {
            for (Long fileId : dto.getReferencedFileIds()) {
                // 检查文件是否在说说内容或图片列表中使用
                if (isFileInTalk(fileId, dto.getContent(), dto.getImages())) {
                    validFileIds.add(fileId);
                }
            }
        }

        // 更新文件引用关系（删除旧的，添加验证过的新引用）
        fileService.updateReferences(oldFileIds, validFileIds, "TALK", id);

        Talk updatedTalk = talkMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkUpdatedEvent(this, id, updatedTalk)));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void delete(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }

        // 清理文件引用关系
        fileService.removeReferences("TALK", id);

        talkMapper.deleteById(id);

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void setTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        talk.setIsTop(1);
        talkMapper.updateById(talk);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void cancelTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        talk.setIsTop(0);
        talkMapper.updateById(talk);
    }

    /**
     * 检查文件是否在说说中使用
     * @param fileId 文件ID
     * @param content 说说内容
     * @param images 图片列表
     * @return 是否在使用中
     */
    private boolean isFileInTalk(Long fileId, String content, List<String> images) {
        if (fileId == null) {
            return false;
        }

        // 查询文件信息
        FileMeta fileMeta = fileMetaMapper.selectById(fileId);
        if (fileMeta == null) {
            return false;
        }

        String fileUrl = fileMeta.getUrl();

        // 检查是否在内容中
        if (content != null && content.contains(fileUrl)) {
            return true;
        }

        // 检查是否在图片列表中
        if (images != null && !images.isEmpty()) {
            for (String imageUrl : images) {
                if (imageUrl != null && imageUrl.contains(fileUrl)) {
                    return true;
                }
            }
        }

        return false;
    }
}

