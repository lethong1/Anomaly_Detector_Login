import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
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
      const response = await api.post('/token/', {
        username: values.username,
        password: values.password,
      });
      
      const { access, refresh } = response.data;
      
      if (access && refresh) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: { username: values.username },
            accessToken: access,
            refreshToken: refresh,
          },
        });
        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        message.error('Thiếu thông tin token!');
      }
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Đăng nhập thất bại!');
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