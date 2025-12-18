package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.FileUploadDTO;
import com.blog.model.vo.FileVO;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    FileVO upload(MultipartFile file, FileUploadDTO dto);

    PageResult<FileVO> list(Long page, Long size, String type);

    void delete(Long id);
}

