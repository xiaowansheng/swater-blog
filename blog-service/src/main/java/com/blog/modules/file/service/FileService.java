package com.blog.modules.file.service;


import com.blog.shared.PageResult;
import com.blog.modules.file.model.dto.FileUploadDTO;
import com.blog.modules.file.model.vo.FileVO;
import org.springframework.web.multipart.MultipartFile;
public interface FileService {
    FileVO upload(MultipartFile file, FileUploadDTO dto);

    PageResult<FileVO> list(Long page, Long size, String type);

    void delete(Long id);
}

