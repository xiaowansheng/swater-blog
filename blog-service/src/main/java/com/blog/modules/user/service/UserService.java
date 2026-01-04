package com.blog.modules.user.service;


import com.blog.common.PageResult;
import com.blog.modules.user.model.dto.ResetPasswordDTO;
import com.blog.modules.user.model.dto.UserDTO;
import com.blog.modules.user.model.vo.UserVO;
import java.util.List;
public interface UserService {
    PageResult<UserVO> list(Long page, Long size, String keyword);

    UserVO getById(Long id);

    Long create(UserDTO dto);

    void update(Long id, UserDTO dto);

    void delete(Long id);

    void resetPassword(Long id, ResetPasswordDTO dto);

    void assignRoles(Long id, List<Long> roleIds);
}

