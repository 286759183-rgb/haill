export type UserRole = 'farmer' | 'teacher' | 'buyer' | 'admin';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'offline';

export interface User {
  id: number;
  phone: string;
  nickname: string;
  role: UserRole;
  region?: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Tutorial {
  id: number;
  title: string;
  category: string;
  cropOrBreed?: string;
  content: string;
  mediaUrl?: string;
  authorId?: number;
  status: ReviewStatus;
  createdAt: string;
}

export interface Question {
  id: number;
  farmerId: number;
  title: string;
  description: string;
  category?: string;
  cropOrBreed?: string;
  region?: string;
  mediaUrl?: string;
  status: 'pending' | 'answered' | 'closed' | 'offline';
  answers: Answer[];
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  teacherId: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface TeacherApplication {
  id: number;
  userId: number;
  realName: string;
  expertise: string;
  region?: string;
  credentialUrl?: string;
  intro?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
}

export interface Supply {
  id: number;
  farmerId: number;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  region: string;
  availableAt?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  selfDeliveryPrice?: number;
  pickupPrice?: number;
  priceUnit: string;
  contactPhone?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface PurchaseDemand {
  id: number;
  buyerId: number;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  region: string;
  purchaseAt?: string;
  qualityRequirement?: string;
  selfDeliveryPrice?: number;
  pickupPrice?: number;
  priceUnit: string;
  contactPhone?: string;
  status: ReviewStatus | 'closed';
  createdAt: string;
}
