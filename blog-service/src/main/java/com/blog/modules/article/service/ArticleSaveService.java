package com.blog.modules.article.service;


import com.blog.modules.article.model.dto.ArticleSaveDTO;
import com.blog.modules.article.model.vo.ArticleSaveResultVO;
/**
 * 文章保存服务接口
 * 支持自动保存和手动保存，包含并发控制和版本管理
 */
public interface ArticleSaveService {
    
    /**
     * 保存文章（新建或更新）
     * 
     * @param dto 文章保存数据
     * @return 保存结果
     */
    ArticleSaveResultVO save(ArticleSaveDTO dto);
    
    /**
     * 获取文章当前版本
     * 
     * @param id 文章ID
     * @return 当前版本号
     */
    Long getCurrentVersion(Long id);
    
    /**
     * 检查文章是否存在冲突
     * 
     * @param id 文章ID
     * @param clientVersion 客户端版本号
     * @return 是否存在冲突
     */
    boolean hasConflict(Long id, Long clientVersion);
}
