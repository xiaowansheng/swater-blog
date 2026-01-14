package com.blog.modules.system.api.service;


import com.blog.modules.system.api.model.dto.ApiDTO;
import com.blog.modules.system.api.model.vo.ApiVO;
import java.util.List;
/**
 * API接口资源服务
 * <p>
 * 提供接口资源的管理功能，包括：
 * - 查询接口列表（树形结构）
 * - 手动CRUD操作（创建、更新、删除）
 * - 自动刷新（扫描注解同步接口）
 * </p>
 */
public interface ApiResourceService {
    /**
     * 查询所有接口列表（树形结构）
     */
    List<ApiVO> tree();

    /**
     * 根据ID获取接口详情
     */
    ApiVO getById(Long id);

    /**
     * 手动创建接口
     */
    Long create(ApiDTO dto);

    /**
     * 更新接口信息
     */
    void update(Long id, ApiDTO dto);

    /**
     * 删除接口
     */
    void delete(Long id);

    /**
     * 刷新接口资源
     * 自动扫描系统中的所有接口并同步到数据库
     */
    void refresh();
}

