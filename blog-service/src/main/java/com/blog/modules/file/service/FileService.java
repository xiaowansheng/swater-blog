package com.blog.modules.file.service;


import com.blog.shared.PageResult;
import com.blog.modules.file.model.dto.FileUploadDTO;
import com.blog.modules.file.model.vo.FileVO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
public interface FileService {
    FileVO upload(MultipartFile file, FileUploadDTO dto);

    FileVO uploadByUrl(String url, FileUploadDTO dto);

    PageResult<FileVO> list(Long page, Long size, String type);

    void delete(Long id);

    /**
     * 为文件批量添加引用关系
     * @param fileIds 文件ID列表
     * @param refType 引用类型（ARTICLE/TALK/COMMENT等）
     * @param refId 引用对象ID
     */
    void addReferences(List<Long> fileIds, String refType, Long refId);

    /**
     * 删除指定引用对象的所有文件引用关系
     * @param refType 引用类型
     * @param refId 引用对象ID
     */
    void removeReferences(String refType, Long refId);

    /**
     * 更新引用关系：删除旧的，添加新的
     * @param oldFileIds 旧文件ID列表
     * @param newFileIds 新文件ID列表
     * @param refType 引用类型
     * @param refId 引用对象ID
     */
    void updateReferences(List<Long> oldFileIds, List<Long> newFileIds, String refType, Long refId);

    /**
     * 根据URL查询文件ID
     * @param url 文件URL
     * @return 文件ID，如果不存在则返回null
     */
    Long getFileIdByUrl(String url);

    /**
     * 根据引用对象查询文件列表
     * @param refType 引用类型
     * @param refId 引用对象ID
     * @return 文件列表
     */
    List<FileVO> listByReference(String refType, Long refId);
}

