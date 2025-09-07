

import type { Space, Card } from './types';
import { SpaceType } from './types';

export const INITIAL_MONEY = 15000000;
export const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
export const PLAYER_ICONS = ['fa-horse', 'fa-dragon', 'fa-otter', 'fa-cat'];

export const JAIL_POSITION = 10;
export const GO_TO_JAIL_POSITION = 30;

export const BOARD_DATA: Space[] = [
  { id: 0, name: 'Bắt Đầu', type: SpaceType.GO },
  { id: 1, name: 'Phố Hàng Mã', type: SpaceType.PROPERTY, price: 600000, rent: 20000, colorGroup: 'purple' },
  { id: 2, name: 'Khí Vận', type: SpaceType.COMMUNITY_CHEST },
  { id: 3, name: 'Phố Hàng Đào', type: SpaceType.PROPERTY, price: 600000, rent: 40000, colorGroup: 'purple' },
  { id: 4, name: 'Thuế Thu Nhập', type: SpaceType.TAX, price: 2000000 },
  { id: 5, name: 'Sân bay Nội Bài', type: SpaceType.RAILROAD, price: 2000000, rent: 250000 },
  { id: 6, name: 'Cầu Rồng', type: SpaceType.PROPERTY, price: 1000000, rent: 60000, colorGroup: 'lightblue' },
  { id: 7, name: 'Cơ Hội', type: SpaceType.CHANCE },
  { id: 8, name: 'Bãi biển Mỹ Khê', type: SpaceType.PROPERTY, price: 1000000, rent: 60000, colorGroup: 'lightblue' },
  { id: 9, name: 'Ngũ Hành Sơn', type: SpaceType.PROPERTY, price: 1200000, rent: 80000, colorGroup: 'lightblue' },
  { id: 10, name: 'Tù / Thăm Tù', type: SpaceType.JAIL },
  { id: 11, name: 'Cố đô Huế', type: SpaceType.PROPERTY, price: 1400000, rent: 100000, colorGroup: 'pink' },
  { id: 12, name: 'Công ty Điện Lực', type: SpaceType.UTILITY, price: 1500000, rent: 100000 },
  { id: 13, name: 'Sông Hương', type: SpaceType.PROPERTY, price: 1400000, rent: 100000, colorGroup: 'pink' },
  { id: 14, name: 'Chùa Thiên Mụ', type: SpaceType.PROPERTY, price: 1600000, rent: 120000, colorGroup: 'pink' },
  { id: 15, name: 'Ga Sài Gòn', type: SpaceType.RAILROAD, price: 2000000, rent: 250000 },
  { id: 16, name: 'Phố cổ Hội An', type: SpaceType.PROPERTY, price: 1800000, rent: 140000, colorGroup: 'orange' },
  { id: 17, name: 'Khí Vận', type: SpaceType.COMMUNITY_CHEST },
  { id: 18, name: 'Chùa Cầu', type: SpaceType.PROPERTY, price: 1800000, rent: 140000, colorGroup: 'orange' },
  { id: 19, name: 'Sông Hoài', type: SpaceType.PROPERTY, price: 2000000, rent: 160000, colorGroup: 'orange' },
  { id: 20, name: 'Đỗ Xe Miễn Phí', type: SpaceType.FREE_PARKING },
  { id: 21, name: 'Đường Đồng Khởi', type: SpaceType.PROPERTY, price: 2200000, rent: 180000, colorGroup: 'red' },
  { id: 22, name: 'Cơ Hội', type: SpaceType.CHANCE },
  { id: 23, name: 'Nhà hát Thành Phố', type: SpaceType.PROPERTY, price: 2200000, rent: 180000, colorGroup: 'red' },
  { id: 24, name: 'Phố đi bộ Nguyễn Huệ', type: SpaceType.PROPERTY, price: 2400000, rent: 200000, colorGroup: 'red' },
  { id: 25, name: 'Sân bay Tân Sơn Nhất', type: SpaceType.RAILROAD, price: 2000000, rent: 250000 },
  { id: 26, name: 'Tháp bà Ponagar', type: SpaceType.PROPERTY, price: 2600000, rent: 220000, colorGroup: 'yellow' },
  { id: 27, name: 'Vinpearl Nha Trang', type: SpaceType.PROPERTY, price: 2600000, rent: 220000, colorGroup: 'yellow' },
  { id: 28, name: 'Công ty Cấp Nước', type: SpaceType.UTILITY, price: 1500000, rent: 100000 },
  { id: 29, name: 'Bãi biển Nha Trang', type: SpaceType.PROPERTY, price: 2800000, rent: 240000, colorGroup: 'yellow' },
  { id: 30, name: 'Vào Tù', type: SpaceType.GO_TO_JAIL },
  { id: 31, name: 'JW Marriott Phú Quốc', type: SpaceType.PROPERTY, price: 3000000, rent: 260000, colorGroup: 'green' },
  { id: 32, name: 'InterContinental Phú Quốc', type: SpaceType.PROPERTY, price: 3000000, rent: 260000, colorGroup: 'green' },
  { id: 33, name: 'Khí Vận', type: SpaceType.COMMUNITY_CHEST },
  { id: 34, name: 'Vinpearl Resort & Spa Phú Quốc', type: SpaceType.PROPERTY, price: 3200000, rent: 280000, colorGroup: 'green' },
  { id: 35, name: 'Sân bay Đà Nẵng', type: SpaceType.RAILROAD, price: 2000000, rent: 250000 },
  { id: 36, name: 'Cơ Hội', type: SpaceType.CHANCE },
  { id: 37, name: 'Bitexco Financial Tower', type: SpaceType.PROPERTY, price: 3500000, rent: 350000, colorGroup: 'darkblue' },
  { id: 38, name: 'Thuế Đặc Biệt', type: SpaceType.TAX, price: 1000000 },
  { id: 39, name: 'Landmark 81', type: SpaceType.PROPERTY, price: 4000000, rent: 500000, colorGroup: 'darkblue' },
];

export const CHANCE_CARDS: Card[] = [
  { description: 'Ngân hàng trả cổ tức 500.000 VND.', action: { type: 'money', amount: 500000 } },
  { description: 'Tiến đến ô Bắt Đầu.', action: { type: 'move', position: 0 } },
  { description: 'Bị phạt 150.000 VND vì đi sai luật.', action: { type: 'money', amount: -150000 } },
];

export const COMMUNITY_CHEST_CARDS: Card[] = [
  { description: 'Lỗi ngân hàng, bạn nhận được 2.000.000 VND.', action: { type: 'money', amount: 2000000 } },
  { description: 'Trả phí bác sĩ 500.000 VND.', action: { type: 'money', amount: -500000 } },
  { description: 'Bán cổ phiếu được 500.000 VND.', action: { type: 'money', amount: 500000 } },
  { description: 'Quỹ du lịch đáo hạn. Nhận 1.000.000 VND.', action: { type: 'money', amount: 1000000 } },
];
