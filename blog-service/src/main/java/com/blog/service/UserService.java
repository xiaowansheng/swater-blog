package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.ResetPasswordDTO;
import com.blog.model.dto.UserDTO;
import com.blog.model.vo.UserVO;

public interface UserService {
    PageResult<UserVO> list(Long page, Long size, String keyword);

    UserVO getById(Long id);

    Long create(UserDTO dto);

    void update(Long id, UserDTO dto);

    void delete(Long id);

    void resetPassword(Long id, ResetPasswordDTO dto);

    void assignRoles(Long id, java.util.List<Long> roleIds);
}

