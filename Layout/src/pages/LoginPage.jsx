import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import '../css/login.css';

const { Title } = Typography;

export default function LoginPage() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/login/', {
        username: values.username,
        password: values.password,
      });
      
      const { access, refresh, status:resp_status, message:message } = response.data;
      
      if (resp_status === 'success') {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user || { username: values.username },
            accessToken: access,
            refreshToken: refresh,
            ipAddress: response.data.ip_address,
          },
        });
        notification.success({
          message: 'Đăng nhập thành công!',
          description: response.data.message || 'Đăng nhập thành công!',
        });
        navigate('/dashboard');
      } else {
        notification.error({
          message: 'Đăng nhập thất bại!',
          description: response.data.message || 'Đăng nhập thất bại!',
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        notification.error({
          message: 'Đã có lỗi xảy ra!',
          description: error.response.data.message || 'Đã có lỗi xảy ra, vui lòng thử lại!',
        });
      } else {
        notification.error({
          message: 'Đã có lỗi xảy ra!',
          description: 'Đã có lỗi xảy ra, vui lòng thử lại!',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={3} className="login-title">Đăng nhập hệ thống</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Tên đăng nhập" 
              size="large" 
              autoFocus 
              className="login-input"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mật khẩu" 
              size="large" 
              className="login-input"
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading}
              className="login-button"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 