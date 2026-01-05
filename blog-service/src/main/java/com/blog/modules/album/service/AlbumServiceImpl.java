package com.blog.modules.album.service;



import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.bootstrap.context.UserContext;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.album.mapper.AlbumMapper;
import com.blog.modules.content.picture.mapper.PictureMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.album.model.dto.AlbumDTO;
import com.blog.modules.album.model.entity.Album;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.album.model.vo.AlbumVO;
import com.blog.modules.album.service.AlbumService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class AlbumServiceImpl implements AlbumService {
    @Autowired
    private AlbumMapper albumMapper;

    @Autowired
    private PictureMapper pictureMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<AlbumVO> list(Long page, Long size, Long userId, String status) {
        Page<Album> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();

        if (userId != null) {
            wrapper.eq(Album::getUserId, userId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Album::getStatus, status);
        }

        wrapper.orderByDesc(Album::getCreateTime);

        Page<Album> result = albumMapper.selectPage(pageParam, wrapper);
        List<AlbumVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public AlbumVO getById(Long id) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            return null;
        }
        return convertToVO(album);
    }

    @Override
    @Transactional
    public Long create(AlbumDTO dto) {
        Album album = BeanUtil.copyProperties(dto, Album.class);
        album.setAlbumKey(KeyUtil.generateKey("album"));

        if (UserContext.isLoggedIn()) {
            album.setUserId(UserContext.getCurrentUserId());
        }

        if (album.getStatus() == null || album.getStatus().isEmpty()) {
            album.setStatus("1");
        }

        albumMapper.insert(album);
        return album.getId();
    }

    @Override
    @Transactional
    public void update(Long id, AlbumDTO dto) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException("相册不存在");
        }

        BeanUtils.copyProperties(dto, album);
        albumMapper.updateById(album);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Album album = albumMapper.selectById(id);
        if (album == null) {
            throw new BusinessException("相册不存在");
        }
        albumMapper.deleteById(id);
    }

    private AlbumVO convertToVO(Album album) {
        AlbumVO vo = BeanUtil.copyProperties(album, AlbumVO.class);
        if (album.getUserId() != null) {
            User user = userMapper.selectById(album.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
            }
        }
        Integer pictureCount = pictureMapper.countByAlbumId(album.getId());
        vo.setPictureCount(pictureCount != null ? pictureCount : 0);
        return vo;
    }
}

