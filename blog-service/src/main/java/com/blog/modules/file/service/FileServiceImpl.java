package com.blog.modules.file.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
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
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.PageUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
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

            // 上传时不建立引用关系，统一在保存业务对象时建立

            return convertToVO(fileMeta);
        } catch (Exception e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public FileVO uploadByUrl(String url, FileUploadDTO dto) {
        if (!StringUtils.hasText(url)) {
            throw new BusinessException("URL????????????");
        }

        try {
            URL parsedUrl = new URL(url);
            String protocol = parsedUrl.getProtocol();
            if (!"http".equalsIgnoreCase(protocol) && !"https".equalsIgnoreCase(protocol)) {
                throw new BusinessException("?????????HTTP/HTTPS URL");
            }

            HttpResponse response = HttpRequest.get(url).timeout(10000).execute();
            if (response.getStatus() >= 400) {
                throw new BusinessException("??????????????????: " + response.getStatus());
            }

            byte[] bytes = response.bodyBytes();
            String contentType = response.header("Content-Type");
            String fileName = buildFileName(parsedUrl, contentType);

            ByteArrayMultipartFile multipartFile = new ByteArrayMultipartFile("file", fileName, contentType, bytes);
            return upload(multipartFile, dto);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("??????????????????: " + e.getMessage());
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
            
            EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new FileDeletedEvent(this, id)));
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
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new FileUploadedEvent(this, fileMeta.getId(), savedFileMeta)));
        
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



    private static class ByteArrayMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        private ByteArrayMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content != null ? content : new byte[0];
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() {
            return content;
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException {
            Files.write(dest.toPath(), content);
        }
    }

    private String buildFileName(URL url, String contentType) {
        String path = url.getPath();
        String name = path != null ? path.substring(path.lastIndexOf('/') + 1) : "";
        if (name == null || name.isEmpty()) {
            name = "file";
        }

        boolean hasExtension = name.contains(".");
        if (!hasExtension) {
            String extension = extensionFromContentType(contentType);
            if (!extension.isEmpty()) {
                name = name + "." + extension;
            }
        }

        return name;
    }

    private String extensionFromContentType(String contentType) {
        if (contentType == null) {
            return "";
        }
        String normalized = contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
        switch (normalized) {
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/gif":
                return "gif";
            case "image/webp":
                return "webp";
            case "image/bmp":
                return "bmp";
            case "image/svg+xml":
                return "svg";
            case "text/html":
                return "html";
            case "text/plain":
                return "txt";
            case "application/pdf":
                return "pdf";
            default:
                return "";
        }
    }

    private FileVO convertToVO(FileMeta fileMeta) {
        return convertToVO(fileMeta, null);
    }

    private FileVO convertToVO(FileMeta fileMeta, Map<Long, User> userMap) {
        FileVO vo = BeanUtil.copyProperties(fileMeta, FileVO.class);
        if (fileMeta.getUploadUserId() != null) {
            User user = userMap != null ? userMap.get(fileMeta.getUploadUserId()) : null;
            if (user == null) {
                user = userMapper.selectById(fileMeta.getUploadUserId());
            }
            if (user != null) {
                vo.setUploadUserName(user.getNickname());
            }
        }
        return vo;
    }

    @Override
    @Transactional
    public void addReferences(List<Long> fileIds, String refType, Long refId) {
        if (fileIds == null || fileIds.isEmpty() || refType == null || refId == null) {
            return;
        }

        List<Long> distinctFileIds = fileIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (distinctFileIds.isEmpty()) {
            return;
        }

        // 批量查询存在的文件，过滤不存在的 fileId
        List<FileMeta> fileMetas = fileMetaMapper.selectBatchIds(distinctFileIds);
        if (fileMetas == null || fileMetas.isEmpty()) {
            return;
        }
        List<Long> existingFileIds = fileMetas.stream()
                .map(FileMeta::getId)
                .collect(Collectors.toList());

        // 批量查询已有引用，避免逐条 selectCount
        List<FileReference> existedReferences = fileReferenceMapper.selectList(
                new LambdaQueryWrapper<FileReference>()
                        .eq(FileReference::getRefType, refType)
                        .eq(FileReference::getRefId, refId)
                        .in(FileReference::getFileId, existingFileIds)
        );
        java.util.Set<Long> existedFileIdSet = existedReferences.stream()
                .map(FileReference::getFileId)
                .collect(Collectors.toSet());

        List<Long> toInsertFileIds = existingFileIds.stream()
                .filter(fileId -> !existedFileIdSet.contains(fileId))
                .collect(Collectors.toList());
        if (toInsertFileIds.isEmpty()) {
            return;
        }

        // 批量插入引用关系
        LocalDateTime now = LocalDateTime.now();
        List<FileReference> newReferences = toInsertFileIds.stream()
                .map(fileId -> {
                    FileReference reference = new FileReference();
                    reference.setFileId(fileId);
                    reference.setRefType(refType);
                    reference.setRefId(refId);
                    reference.setCreateTime(now);
                    return reference;
                })
                .collect(Collectors.toList());
        fileReferenceMapper.insertBatch(newReferences);

        // 批量更新引用计数
        fileMetaMapper.update(
                null,
                new LambdaUpdateWrapper<FileMeta>()
                        .in(FileMeta::getId, toInsertFileIds)
                        .setSql("ref_count = COALESCE(ref_count, 0) + 1")
        );
    }

    @Override
    @Transactional
    public void removeReferences(String refType, Long refId) {
        if (refType == null || refId == null) {
            return;
        }

        // 查询所有引用关系
        List<FileReference> references = fileReferenceMapper.selectList(
            new LambdaQueryWrapper<FileReference>()
                .eq(FileReference::getRefType, refType)
                .eq(FileReference::getRefId, refId)
        );
        if (references == null || references.isEmpty()) {
            return;
        }

        // 同一个 fileId 可能有多条引用，先聚合减少次数
        Map<Long, Long> decreaseByFileId = references.stream()
                .collect(Collectors.groupingBy(FileReference::getFileId, Collectors.counting()));
        List<Long> fileIds = new ArrayList<>(decreaseByFileId.keySet());
        List<FileMeta> fileMetas = fileMetaMapper.selectBatchIds(fileIds);

        List<Long> deleteFileIds = new ArrayList<>();
        List<String> deleteFilePaths = new ArrayList<>();
        Map<Long, Integer> remainRefCount = new HashMap<>();

        for (FileMeta fileMeta : fileMetas) {
            if (fileMeta == null || fileMeta.getId() == null) {
                continue;
            }
            int current = fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0;
            int decrease = decreaseByFileId.getOrDefault(fileMeta.getId(), 0L).intValue();
            int newRefCount = Math.max(0, current - decrease);
            if (newRefCount <= 0) {
                deleteFileIds.add(fileMeta.getId());
                deleteFilePaths.add(fileMeta.getFilePath());
            } else {
                remainRefCount.put(fileMeta.getId(), newRefCount);
            }
        }

        // 更新仍保留的文件引用计数
        for (Map.Entry<Long, Integer> entry : remainRefCount.entrySet()) {
            fileMetaMapper.update(
                    null,
                    new LambdaUpdateWrapper<FileMeta>()
                            .eq(FileMeta::getId, entry.getKey())
                            .set(FileMeta::getRefCount, entry.getValue())
            );
        }

        // 引用归零时删除物理文件和元数据，并清理其全部引用关系
        if (!deleteFileIds.isEmpty()) {
            try {
                List<StoragePlugin> plugins = storagePluginFactory.getPlugins();
                if (!plugins.isEmpty()) {
                    for (String path : deleteFilePaths) {
                        if (path != null && !path.isBlank()) {
                            plugins.get(0).delete(path);
                        }
                    }
                }
            } catch (Exception e) {
                // 记录日志但继续执行
            }

            fileMetaMapper.deleteBatchIds(deleteFileIds);
            fileReferenceMapper.delete(
                    new LambdaQueryWrapper<FileReference>()
                            .in(FileReference::getFileId, deleteFileIds)
            );
        }

        // 删除所有引用关系
        fileReferenceMapper.deleteByRefTypeAndRefId(refType, refId);
    }

    @Override
    @Transactional
    public void updateReferences(List<Long> oldFileIds, List<Long> newFileIds, String refType, Long refId) {
        if (refType == null || refId == null) {
            return;
        }

        // 删除旧引用
        if (oldFileIds != null && !oldFileIds.isEmpty()) {
            for (Long oldFileId : oldFileIds) {
                fileReferenceMapper.delete(
                    new LambdaQueryWrapper<FileReference>()
                        .eq(FileReference::getFileId, oldFileId)
                        .eq(FileReference::getRefType, refType)
                        .eq(FileReference::getRefId, refId)
                );

                // 减少引用计数
                FileMeta fileMeta = fileMetaMapper.selectById(oldFileId);
                if (fileMeta != null) {
                    int newRefCount = (fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0) - 1;
                    fileMeta.setRefCount(Math.max(0, newRefCount));
                    fileMetaMapper.updateById(fileMeta);
                }
            }
        }

        // 添加新引用
        addReferences(newFileIds, refType, refId);
    }

    @Override
    public Long getFileIdByUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        FileMeta fileMeta = fileMetaMapper.selectOne(
            new LambdaQueryWrapper<FileMeta>()
                .eq(FileMeta::getUrl, url.trim())
                .last("LIMIT 1")
        );

        return fileMeta != null ? fileMeta.getId() : null;
    }

    @Override
    public List<FileVO> listByReference(String refType, Long refId) {
        if (refType == null || refId == null) {
            return List.of();
        }

        // 查询引用关系
        List<FileReference> references = fileReferenceMapper.selectList(
            new LambdaQueryWrapper<FileReference>()
                .eq(FileReference::getRefType, refType)
                .eq(FileReference::getRefId, refId)
        );

        if (references.isEmpty()) {
            return List.of();
        }

        // 获取文件ID列表
        List<Long> fileIds = references.stream()
            .map(FileReference::getFileId)
            .collect(Collectors.toList());

        // 查询文件列表
        List<FileMeta> fileMetas = fileMetaMapper.selectList(
            new LambdaQueryWrapper<FileMeta>()
                .in(FileMeta::getId, fileIds)
        );

        Map<Long, User> userMap = buildUserMap(fileMetas);

        return fileMetas.stream()
            .map(fileMeta -> convertToVO(fileMeta, userMap))
            .collect(Collectors.toList());
    }

    @Override
    public Map<Long, List<FileVO>> listByReferencesBatch(String refType, List<Long> refIds) {
        if (refType == null || refIds == null || refIds.isEmpty()) {
            return Map.of();
        }

        // 查询所有引用关系
        List<FileReference> references = fileReferenceMapper.selectList(
            new LambdaQueryWrapper<FileReference>()
                .eq(FileReference::getRefType, refType)
                .in(FileReference::getRefId, refIds)
        );

        if (references.isEmpty()) {
            return refIds.stream()
                .collect(Collectors.toMap(id -> id, id -> List.of()));
        }

        // 获取文件ID列表
        List<Long> fileIds = references.stream()
            .map(FileReference::getFileId)
            .distinct()
            .collect(Collectors.toList());

        // 批量查询文件
        List<FileMeta> fileMetas = fileMetaMapper.selectList(
            new LambdaQueryWrapper<FileMeta>()
                .in(FileMeta::getId, fileIds)
        );

        Map<Long, User> userMap = buildUserMap(fileMetas);

        Map<Long, FileVO> fileVOMap = new HashMap<>();
        for (FileMeta fileMeta : fileMetas) {
            fileVOMap.put(fileMeta.getId(), convertToVO(fileMeta, userMap));
        }

        // 按refId分组
        Map<Long, List<FileVO>> result = new HashMap<>();
        for (Long refId : refIds) {
            result.put(refId, new ArrayList<>());
        }

        // 填充文件列表
        for (FileReference reference : references) {
            FileVO fileVO = fileVOMap.get(reference.getFileId());
            if (fileVO != null) {
                result.get(reference.getRefId()).add(fileVO);
            }
        }

        return result;
    }

    private Map<Long, User> buildUserMap(List<FileMeta> fileMetas) {
        if (fileMetas == null || fileMetas.isEmpty()) {
            return Map.of();
        }
        List<Long> userIds = fileMetas.stream()
                .map(FileMeta::getUploadUserId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
    }
}
