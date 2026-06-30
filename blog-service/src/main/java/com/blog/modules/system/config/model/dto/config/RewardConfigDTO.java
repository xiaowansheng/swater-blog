package com.blog.modules.system.config.model.dto.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 赞赏配置
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RewardConfigDTO {
    /**
     * 启用打赏功能
     */
    private Boolean rewardEnabled;
    
    /**
     * 微信打赏配置
     */
    private PaymentMethod wechat;
    
    /**
     * 支付宝打赏配置
     */
    private PaymentMethod alipay;

    @Data
    public static class PaymentMethod {
        private Boolean enabled;
        private String qr;
    }

    /**
     * 转换为给前台展示的安全视图
     * 过滤掉未启用的打赏方式
     */
    public RewardConfigDTO toPublicView() {
        RewardConfigDTO view = new RewardConfigDTO();
        
        // 如果总开关被关闭，直接返回禁用状态，不附带任何二维码信息
        if (Boolean.FALSE.equals(this.rewardEnabled)) {
            view.setRewardEnabled(false);
            return view;
        }
        
        // 默认认为是开启的（如果未配置）
        view.setRewardEnabled(true);
        
        // 分别判断微信和支付宝是否启用
        if (this.wechat != null && !Boolean.FALSE.equals(this.wechat.getEnabled())) {
            view.setWechat(this.wechat);
        }
        
        if (this.alipay != null && !Boolean.FALSE.equals(this.alipay.getEnabled())) {
            view.setAlipay(this.alipay);
        }
        
        return view;
    }
}
