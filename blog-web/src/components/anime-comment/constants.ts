import { Emoji } from './types';

/**
 * 二次元头像列表（使用公共动漫头像API）
 */
export const ANIME_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=d1f4d1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=fff1b1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=10&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zai',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Kitty',
  'https://api.dicebear.com/7.x/notionists/svg?seed=1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=2',
  'https://api.dicebear.com/7.x/notionists/svg?seed=3',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=1',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=2',
];

/**
 * 根据昵称或ID获取随机二次元头像
 */
export const getRandomAnimeAvatar = (seed: string | number): string => {
  const index = Math.abs(String(seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % ANIME_AVATARS.length;
  return ANIME_AVATARS[index];
};

/**
 * 颜文字表情
 */
export const KAOMOJI_EMOJIS: Emoji[] = [
  // 开心
  { id: 'happy1', name: '(^_^)', url: '', category: '开心' },
  { id: 'happy2', name: '(^_^)v', url: '', category: '开心' },
  { id: 'happy3', name: '(*^▽^*)', url: '', category: '开心' },
  { id: 'happy4', name: '(≧◡≦)', url: '', category: '开心' },
  { id: 'happy5', name: '＼(^o^)／', url: '', category: '开心' },
  { id: 'happy6', name: '(o´∀`o)', url: '', category: '开心' },
  { id: 'happy7', name: '(☆^O^☆)', url: '', category: '开心' },
  { id: 'happy8', name: '(≧▽≦)/', url: '', category: '开心' },

  // 难过
  { id: 'sad1', name: '(T_T)', url: '', category: '难过' },
  { id: 'sad2', name: '(〒_〒)', url: '', category: '难过' },
  { id: 'sad3', name: '(´；ω；`)', url: '', category: '难过' },
  { id: 'sad4', name: '(つ﹏⊂)', url: '', category: '难过' },
  { id: 'sad5', name: '(ಥ﹏ಥ)', url: '', category: '难过' },

  // 惊讶
  { id: 'surprise1', name: '(O_O)', url: '', category: '惊讶' },
  { id: 'surprise2', name: '(o_O)', url: '', category: '惊讶' },
  { id: 'surprise3', name: '(O_o)', url: '', category: '惊讶' },
  { id: 'surprise4', name: 'Σ(ﾟДﾟ;)', url: '', category: '惊讶' },
  { id: 'surprise5', name: 'Σ(･口･)', url: '', category: '惊讶' },
  { id: 'surprise6', name: '(⊙_⊙;)', url: '', category: '惊讶' },

  // 害羞
  { id: 'shy1', name: '(⁄ ⁄•⁄ω⁄•⁄ ⁄)', url: '', category: '害羞' },
  { id: 'shy2', name: '(｡･ω･｡)', url: '', category: '害羞' },
  { id: 'shy3', name: '(//ω//)', url: '', category: '害羞' },
  { id: 'shy4', name: '(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)', url: '', category: '害羞' },
  { id: 'shy5', name: '(´•ω•`)', url: '', category: '害羞' },

  // 生气
  { id: 'angry1', name: '(╬ಠ益ಠ)', url: '', category: '生气' },
  { id: 'angry2', name: '(╯°□°）╯︵ ┻━┻', url: '', category: '生气' },
  { id: 'angry3', name: '٩(๑`^´๑)۶', url: '', category: '生气' },
  { id: 'angry4', name: '(ノ｀Д´)ノ', url: '', category: '生气' },
  { id: 'angry5', name: '(҂`з´)', url: '', category: '生气' },

  // 疑问
  { id: 'question1', name: '(￣ω￣;)', url: '', category: '疑问' },
  { id: 'question2', name: '(・_・?)', url: '', category: '疑问' },
  { id: 'question3', name: '(・_・ヾ', url: '', category: '疑问' },
  { id: 'question4', name: '(¬_¬ )', url: '', category: '疑问' },
  { id: 'question5', name: '(~_~;)', url: '', category: '疑问' },

  // 其他
  { id: 'other1', name: '( ┐΄؎ذ` )┐', url: '', category: '其他' },
  { id: 'other2', name: '¯\\\\_(ツ)_/¯', url: '', category: '其他' },
  { id: 'other3', name: '(╯_╰)', url: '', category: '其他' },
  { id: 'other4', name: '(☞ﾟヮﾟ)☞', url: '', category: '其他' },
  { id: 'other5', name: 'ψ(｀∇´)ψ', url: '', category: '其他' },
  { id: 'other6', name: 'ヽ(･ω･ゞ)', url: '', category: '其他' },
  { id: 'other7', name: 'd(>w<)', url: '', category: '其他' },
  { id: 'other8', name: '(๑˃̵ᴗ˂̵)و', url: '', category: '其他' },
];

/**
 * 默认评论配置
 */
export const DEFAULT_COMMENT_CONFIG = {
  allowAnonymous: true,
  allowGuest: true,
  enableAudit: false,
  showEmail: true,
  allowImage: true,
  maxImages: 3,
  maxImageSize: 5,
};
