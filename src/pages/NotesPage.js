// src/pages/NotesPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, Typography, notification } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import './NotesPage.css';

const { Title } = Typography;

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Fetch notes for the logged-in user
        const fetchNotes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/notes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setNotes(response.data);
            } catch (error) {
                console.error(error);
                notification.error({
                    message: 'Failed to Fetch Notes',
                    description: 'Could not fetch notes from the server.'
                });
            }
        };

        // Fetch the username
        const fetchUsername = async () => {
            try {
                const response = await axios.get('http://localhost:5000/protected', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUsername(response.data.username);
                fetchNotes();
            } catch (error) {
                console.error(error);
                notification.error({
                    message: 'Failed to Fetch Username',
                    description: 'Could not fetch username from the server.'
                });
            }
        };

        fetchUsername();
    }, []);

    const handleCreateNote = async () => {
        try {
            await axios.post('http://localhost:5000/notes', {
                title,
                content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNotes([...notes, { title, content }]);
            setTitle('');
            setContent('');
            notification.success({
                message: 'Note Created',
                description: 'Your note has been created successfully.'
            });
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Failed to Create Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    const handleUpdateNote = async (noteId, newTitle, newContent) => {
        try {
            await axios.put(`http://localhost:5000/notes/${noteId}`, {
                title: newTitle,
                content: newContent
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNotes(notes.map(note => note._id === noteId ? { ...note, title: newTitle, content: newContent } : note));
            notification.success({
                message: 'Note Updated',
                description: 'Your note has been updated successfully.'
            });
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Failed to Update Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await axios.delete(`http://localhost:5000/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNotes(notes.filter(note => note._id !== noteId));
            notification.success({
                message: 'Note Deleted',
                description: 'Your note has been deleted successfully.'
            });
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Failed to Delete Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    return (
        <div className="notes-page-container">
            <Title level={2} className="notes-page-title">Notes for {username}</Title>
            <Form onFinish={handleCreateNote} className="notes-form">
                <Form.Item
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title of the note!' }]}
                >
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="notes-form-input" />
                </Form.Item>
                <Form.Item
                    label="Content"
                    rules={[{ required: true, message: 'Please input the content of the note!' }]}
                >
                    <Input.TextArea value={content} onChange={(e) => setContent(e.target.value)} className="notes-form-textarea" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="notes-form-button">
                        Create Note
                    </Button>
                </Form.Item>
            </Form>
            <List
                className="notes-list"
                header={<div className="notes-list-header">My Notes</div>}
                bordered
                dataSource={notes}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button onClick={() => handleUpdateNote(item._id, item.title, item.content)} className="notes-list-button">Update</Button>,
                            <Button onClick={() => handleDeleteNote(item._id)} className="notes-list-button">Delete</Button>
                        ]}
                        className="notes-list-item"
                    >
                        <div className="notes-list-item-content">
                            <strong className="notes-list-item-title">{item.title}</strong>
                            <p className="notes-list-item-text">{item.content}</p>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default NotesPage;
