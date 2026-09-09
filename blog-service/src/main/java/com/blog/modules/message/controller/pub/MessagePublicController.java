package com.blog.modules.message.controller.pub;

import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.annotation.RateLimit;
import com.blog.shared.Result;
import com.blog.modules.message.model.dto.EmailCodeDTO;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.message.service.MessageVerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/message")
@ApiOperation(name = "消息公开接口", description = "消息相关接口", open = true)
public class MessagePublicController {
    @Autowired
    private MessageVerificationService messageVerificationService;

    @PostMapping("/email-code")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 600,  // 10分钟窗口
        limit = 5,     // 叠加同一邮箱60秒冷却，防止邮件轰炸
        message = "验证码发送过于频繁，请稍后再试"
    )
    @ApiOperation(name = "发送邮箱验证码", type = ApiOperationType.CREATE, description = "发送邮箱验证码")
    public Result<Void> sendEmailCode(@Valid @RequestBody EmailCodeDTO dto) {
        messageVerificationService.sendEmailCode(dto.getEmail());
        return Result.success();
    }
}
