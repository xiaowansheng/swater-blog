package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.exception.BusinessException;
import com.blog.mapper.FileMetaMapper;
import com.blog.mapper.FileReferenceMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.FileUploadDTO;
import com.blog.model.entity.FileMeta;
import com.blog.model.entity.FileReference;
import com.blog.model.entity.User;
import com.blog.model.vo.FileVO;
import com.blog.service.FileService;
import com.blog.util.BeanUtil;
import com.blog.util.FileStorageUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @Override
    @Transactional
    public FileVO upload(MultipartFile file, FileUploadDTO dto) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        try {
            String fileHash = FileStorageUtil.calculateHash(file);
            FileMeta existingFile = fileMetaMapper.selectOne(new LambdaQueryWrapper<FileMeta>()
                    .eq(FileMeta::getFileHash, fileHash)
                    .eq(FileMeta::getDeleted, 0));

            FileMeta fileMeta;
            if (existingFile != null) {
                fileMeta = existingFile;
                fileMeta.setRefCount((fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0) + 1);
                fileMetaMapper.updateById(fileMeta);
            } else {
                String filePath = FileStorageUtil.generateFilePath(file.getOriginalFilename());
                FileStorageUtil.saveFile(file, filePath);

                fileMeta = new FileMeta();
                fileMeta.setFileHash(fileHash);
                fileMeta.setOriginalName(file.getOriginalFilename());
                fileMeta.setFileType(getFileType(file.getOriginalFilename()));
                fileMeta.setFilePath(filePath);
                fileMeta.setUrl(FileStorageUtil.getFileUrl(filePath));
                fileMeta.setFileSize(file.getSize());
                fileMeta.setMimeType(file.getContentType());
                
                Long userId = StpUtil.getLoginIdAsLong();
                fileMeta.setUploadUserId(userId);
                fileMeta.setStatus("ACTIVE");
                fileMeta.setRefCount(1);
                
                fileMetaMapper.insert(fileMeta);
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
        } catch (IOException e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public PageResult<FileVO> list(Long page, Long size, String type) {
        Page<FileMeta> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<FileMeta> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FileMeta::getDeleted, 0);
        
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
        if (fileMeta == null || fileMeta.getDeleted() == 1) {
            throw new BusinessException("文件不存在");
        }

        fileMeta.setRefCount((fileMeta.getRefCount() != null ? fileMeta.getRefCount() : 0) - 1);
        
        if (fileMeta.getRefCount() <= 0) {
            fileMetaMapper.deleteById(id);
            fileReferenceMapper.deleteByFileId(id);
            FileStorageUtil.deleteFile(fileMeta.getFilePath());
        } else {
            fileMetaMapper.updateById(fileMeta);
        }
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
}

