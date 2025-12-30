package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.ApiDTO;
import com.blog.model.vo.ApiVO;
import com.blog.service.ApiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/api")
@ApiResource(name = "接口管理接口")
public class ApiController {
    @Autowired
    private ApiService apiService;

    @GetMapping("/list")
    public Result<List<ApiVO>> list() {
        List<ApiVO> list = apiService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<ApiVO> getById(@PathVariable Long id) {
        ApiVO vo = apiService.getById(id);
        if (vo == null) {
            return Result.error(404, "接口不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody ApiDTO dto) {
        Long id = apiService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ApiDTO dto) {
        apiService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        apiService.delete(id);
        return Result.success();
    }
}
