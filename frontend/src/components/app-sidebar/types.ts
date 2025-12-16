import type { Component } from "vue";

export interface NavItem {
  title: string;
  url: string;
  icon?: Component;
  isActive?: boolean;
  children?: NavItem[];
}

export interface UserData {
  name: string;
  email: string;
  avatar: string;
}
