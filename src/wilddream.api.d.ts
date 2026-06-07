import { HttpManager } from "./utils/http";
export type WildDreamRouteType = "Art" | "user";
/**
 * 绘画作品信息
 */
export interface WildDreamArtwork {
    artworkid: string;
    userid: string;
    title: string;
    description: string;
    width: string;
    height: string;
    speciesid: string;
    categoryid: string;
    rating: string;
    copyright: string;
    dateline: string;
    updatetime: string | null;
    disablesave: string;
    allowfullimage: string;
    watermark: string;
    ai_adversarial: string;
    showonindex: string;
    cert: string;
    viewcount: string;
    favcount: string;
}
/**
 * 作品作者信息
 */
export interface WildDreamAuthor {
    userid: string;
    username: string;
    userpagename: string;
    thank_fav_text: string;
    avatardate: string;
}
/**
 * 评论 / 收藏中的用户条目
 */
export interface WildDreamUserEntry {
    userid: string;
    dateline: string;
    username: string;
    userpagename: string;
}
/**
 * 作品数据接口的完整响应
 */
export interface WildDreamArtworkResponse {
    success: boolean;
    artwork: WildDreamArtwork;
    author: WildDreamAuthor;
    commentlist: WildDreamUserEntry[];
    favlist: WildDreamUserEntry[];
}
/**
 * 获取绘画作品数据
 *
 * GET https://www.wilddream.net/Art/view/{artworkId}/ajax/1
 *
 * @param http HTTP 客户端
 * @param artworkId 作品 ID
 */
export declare function fetchArtworkData(http: HttpManager, artworkId: string): Promise<WildDreamArtworkResponse>;
/**
 * 用户基本信息
 */
export interface WildDreamUser {
    userid: string;
    username: string;
    userpagename: string;
    introduction: string;
}
/**
 * 用户扩展资料
 */
export interface WildDreamProfile {
    userid: string;
    location: string;
    school: string;
    gender: string;
    birthday: string;
    art_speciality: string;
    art_level: string;
    bilibili: string;
    weibo: string;
    twitter: string;
    tieba: string;
    plurk: string;
    pixiv: string;
    deviantart: string;
    facebook_url: string;
    fursona_name: string;
    fursona_species: string;
    fursona_img: string;
    fursona_description: string;
    furaffinity: string;
    commission_status: string | null;
    commission_info_title: string | null;
    commission_info_content: string | null;
    commission_dateline: string | null;
    custom_block_title: string | null;
    custom_block_content: string | null;
}
/**
 * 关注 / 被关注 / 浏览记录中的用户条目
 */
export interface WildDreamWatchEntry {
    userid: string;
    username: string;
    userpagename: string;
    dateline: string;
}
/**
 * 留言板条目
 */
export interface WildDreamShoutEntry {
    shoutid: string;
    shouterid: string;
    username: string;
    userpagename: string;
    dateline: string;
    content: string;
}
/**
 * 用户页面接口的完整响应
 */
export interface WildDreamUserProfileResponse {
    user: WildDreamUser;
    profile: WildDreamProfile;
    watch: WildDreamWatchEntry | null;
    watchlist: WildDreamWatchEntry[];
    watchedlist: WildDreamWatchEntry[];
    viewlogs: WildDreamWatchEntry[];
    shoutlist: WildDreamShoutEntry[];
    artworkcount: number;
    favcount: number;
    pageviews: number;
}
/**
 * 获取用户页面数据
 *
 * GET https://www.wilddream.net/Art/userpage/profile/userpagename/{userName}/ajax/1
 *
 * @param http HTTP 客户端
 * @param userName 用户主页名 (userpagename)
 */
export declare function fetchUserProfileData(http: HttpManager, userName: string): Promise<WildDreamUserProfileResponse>;
/**
 * 获取用户头像 URL
 * @param userId
 * @param size
 */
export declare function getUserHeadshotURL(userId: string | number, size?: "large"): string;
/**
 * 获取绘画图片 URL
 * @param userId
 * @param artworkId
 * @param size
 */
export declare function getArtworkImageURL(userId: string | number, artworkId: string | number, size?: "preview" | "thumb"): string;
