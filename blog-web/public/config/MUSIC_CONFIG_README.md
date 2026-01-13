# 音乐播放器配置说明

## 配置文件位置

音乐播放器的配置文件位于：`public/config/music.json`

## 配置格式

```json
{
  "defaultPlaylist": [
    {
      "id": "歌曲唯一ID",
      "title": "歌曲标题",
      "artist": "艺术家",
      "url": "音频文件URL",
      "cover": "专辑封面URL（可选）",
      "duration": 歌曲时长（可选，单位：秒）
    }
  ],
  "autoPlay": false,              // 是否自动播放
  "defaultVolume": 0.7,           // 默认音量 (0-1)
  "defaultPlayMode": "sequential" // 播放模式
}
```

## 播放模式说明

- `sequential`: 顺序播放
- `shuffle`: 随机播放
- `repeat`: 单曲循环

## 音频源说明

你可以使用任何公开可访问的音频URL，例如：

1. **网易云外链**
   ```
   https://music.163.com/song/media/outer/url?id=歌曲ID.mp3
   ```

2. **直链URL**
   ```
   https://example.com/music/song.mp3
   ```

3. **CDN链接**
   ```
   https://cdn.example.com/music/song.mp3
   ```

## 封面图片说明

封面图片可以使用任何公开可访问的图片URL。如果未提供封面，将使用默认封面。

## 配置更新

修改 `music.json` 文件后，刷新页面即可看到新的配置。不需要重新编译项目。

## 备用配置

如果 `music.json` 文件加载失败（例如文件不存在或格式错误），系统会自动使用内置的默认配置作为备用。

默认配置位置：`src/lib/constants/music.ts`

## 示例配置

```json
{
  "defaultPlaylist": [
    {
      "id": "1",
      "title": "樱花树下的约定",
      "artist": "ACG音乐",
      "url": "https://music.163.com/song/media/outer/url?id=1397105803.mp3",
      "cover": "https://picsum.photos/seed/sakura/300/300"
    },
    {
      "id": "2",
      "title": "穿越时空的思念",
      "artist": "犬夜叉ED",
      "url": "https://music.163.com/song/media/outer/url?id=1387581250.mp3",
      "cover": "https://picsum.photos/seed/time/300/300"
    }
  ],
  "autoPlay": false,
  "defaultVolume": 0.7,
  "defaultPlayMode": "sequential"
}
```
