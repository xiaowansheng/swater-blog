package com.blog.modules.file.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.bootstrap.context.UserContext;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.file.mapper.FileReferenceMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.file.model.dto.FileUploadDTO;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.modules.file.model.entity.FileReference;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.file.model.vo.FileVO;
import com.blog.modules.file.event.file.FileDeletedEvent;
import com.blog.modules.file.event.file.FileUploadedEvent;
import com.blog.plugin.components.storage.StoragePlugin;
import com.blog.plugin.components.storage.StoragePluginFactory;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class FileServiceImpl implements FileService {
    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired
    private FileReferenceMapper fileReferenceMapper;

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private StoragePluginFactory storagePluginFactory;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public FileVO upload(MultipartFile file, FileUploadDTO dto) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        try {
            StoragePlugin storagePlugin = storagePluginFactory.getActivePlugin();
            if (storagePlugin == null) {
                throw new BusinessException("未找到可用的存储插件");
            }
            String fileHash = storagePlugin.calculateHash(file);
            FileMeta existingFile = fileMetaMapper.selectOne(new LambdaQueryWrapper<FileMeta>()
                    .eq(FileMeta::getFileHash, fileHash));

            FileMeta fileMeta;
            // 检查数据库中是否存在
            if (existingFile != null) {
                boolean physicalFileExists = true;
                try {
                    physicalFileExists = storagePlugin.exists(existingFile.getFilePath());
                } catch (Exception e) {
                    // 如果检查出错或不支持，保守起见认为文件存在，避免重复上传
                }

                if (physicalFileExists) {
                    fileMeta = existingFile;
                    fileMeta.setRefCount((fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0) + 1);
                    fileMetaMapper.updateById(fileMeta);
                } else {
                    // 如果数据库记录存在但物理文件不存在，清理旧记录并重新上传
                    fileMetaMapper.deleteById(existingFile.getId());
                    fileMeta = performUpload(file, dto, storagePlugin, fileHash);
                }
            } else {
                fileMeta = performUpload(file, dto, storagePlugin, fileHash);
            }

            if (dto.getRefType() != null && dto.getRefId() != null) {
                FileReference reference = new FileReference();
                reference.setFileId(fileMeta.getId());
                reference.setRefType(dto.getRefType());
                reference.setRefId(dto.getRefId());
                reference.setCreateTime(LocalDateTime.now());
                fileReferenceMapper.insert(reference);
            }

            return convertToVO(fileMeta);
        } catch (Exception e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public PageResult<FileVO> list(Long page, Long size, String type) {
        Page<FileMeta> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<FileMeta> wrapper = new LambdaQueryWrapper<>();

        if (type != null && !type.isEmpty()) {
            wrapper.eq(FileMeta::getFileType, type);
        }
        wrapper.orderByDesc(FileMeta::getCreateTime);
        
        Page<FileMeta> result = fileMetaMapper.selectPage(pageParam, wrapper);
        List<FileVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        FileMeta fileMeta = fileMetaMapper.selectById(id);
        if (fileMeta == null) {
            throw new BusinessException("文件不存在");
        }

        fileMeta.setRefCount((fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0) - 1);
        
        if (fileMeta.getRefCount() <= 0) {
            try {
                List<StoragePlugin> plugins = storagePluginFactory.getPlugins();
                if (!plugins.isEmpty()) {
                    plugins.get(0).delete(fileMeta.getFilePath());
                }
            } catch (Exception e) {
                throw new BusinessException("文件删除失败: " + e.getMessage());
            }
            fileMetaMapper.deleteById(id);
            fileReferenceMapper.deleteByFileId(id);
            
            publishEventAfterCommit(() -> eventPublisher.publishEvent(new FileDeletedEvent(this, id)));
        } else {
            fileMetaMapper.updateById(fileMeta);
        }
    }

    private FileMeta performUpload(MultipartFile file, FileUploadDTO dto, StoragePlugin storagePlugin, String fileHash) throws Exception {
        String filePath = storagePlugin.generateFilePath(file.getOriginalFilename(), dto.getCategory());
        storagePlugin.upload(file, filePath);

        FileMeta fileMeta = new FileMeta();
        fileMeta.setFileHash(fileHash);
        fileMeta.setOriginalName(file.getOriginalFilename());
        fileMeta.setFileType(getFileType(file.getOriginalFilename()));
        fileMeta.setFilePath(filePath);
        fileMeta.setUrl(storagePlugin.getUrl(filePath));
        fileMeta.setFileSize(file.getSize());
        fileMeta.setMimeType(file.getContentType());

        Long userId = UserContext.getCurrentUserId();
        fileMeta.setUploadUserId(userId);
        fileMeta.setStatus("ACTIVE");
        fileMeta.setRefCount(1);
        
        fileMetaMapper.insert(fileMeta);
        
        FileMeta savedFileMeta = fileMetaMapper.selectById(fileMeta.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new FileUploadedEvent(this, fileMeta.getId(), savedFileMeta)));
        
        return fileMeta;
    }

    private String getFileType(String filename) {
        if (filename == null) {
            return "unknown";
        }
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (extension.matches("jpg|jpeg|png|gif|webp|bmp")) {
            return "image";
        } else if (extension.matches("pdf|doc|docx|xls|xlsx|ppt|pptx")) {
            return "document";
        } else if (extension.matches("mp4|avi|mov|wmv|flv")) {
            return "video";
        } else if (extension.matches("mp3|wav|flac|aac")) {
            return "audio";
        } else {
            return "other";
        }
    }

    private FileVO convertToVO(FileMeta fileMeta) {
        FileVO vo = BeanUtil.copyProperties(fileMeta, FileVO.class);
        if (fileMeta.getUploadUserId() != null) {
            User user = userMapper.selectById(fileMeta.getUploadUserId());
            if (user != null) {
                vo.setUploadUserName(user.getNickname());
            }
        }
        return vo;
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
