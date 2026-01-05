package com.blog.core.plugin.search;


import com.blog.common.PageResult;
import com.blog.modules.search.model.vo.SearchVO;
/**
 * 搜索引擎插件接口
 */
public interface SearchPlugin {
    /**
     * 搜索
     * @param keyword 搜索关键词
     * @param type 搜索类型（post/moment/comment/all）
     * @param page 页码
     * @param size 每页大小
     * @return 搜索结果
     */
    PageResult<SearchVO> search(String keyword, String type, Long page, Long size);
    
    /**
     * 索引文档（创建或更新）
     * @param indexType 索引类型（post/moment/comment）
     * @param id 文档ID
     * @param document 文档内容（JSON格式）
     */
    void indexDocument(String indexType, Long id, String document) throws Exception;
    
    /**
     * 删除索引文档
     * @param indexType 索引类型（post/moment/comment）
     * @param id 文档ID
     */
    void deleteDocument(String indexType, Long id) throws Exception;
    
    /**
     * 批量索引文档
     * @param indexType 索引类型（post/moment/comment）
     * @param documents 文档列表（每个元素为JSON格式）
     */
    void bulkIndexDocuments(String indexType, java.util.List<java.util.Map<String, Object>> documents) throws Exception;
}

