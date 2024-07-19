import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, Typography, notification, Modal } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import './NotesPage.css';

const { Title } = Typography;

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');
    const [currentNoteId, setCurrentNoteId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/notes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setNotes(response.data);
            } catch (error) {
                console.error('Failed to fetch notes:', error);
                notification.error({
                    message: 'Failed to Fetch Notes',
                    description: 'Could not fetch notes from the server.'
                });
            }
        };

        const fetchUsername = async () => {
            try {
                const response = await axios.get('http://localhost:5000/protected', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log('Fetched username:', response.data); // Debugging line
                if (response.data.username) {
                    setUsername(response.data.username);
                } else {
                    console.error('Username not found in response');
                    notification.error({
                        message: 'Username Fetch Error',
                        description: 'Username not found in the server response.'
                    });
                }
                fetchNotes();
            } catch (error) {
                console.error('Failed to fetch username:', error);
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
            await axios.post('http://localhost:5000/notes', { title, content }, {
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
            console.error('Failed to create note:', error);
            notification.error({
                message: 'Failed to Create Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    const handleUpdateNote = async () => {
        if (!currentNoteId) {
            notification.error({
                message: 'Update Failed',
                description: 'No note ID provided.'
            });
            return;
        }

        try {
            await axios.put(`http://localhost:5000/notes/${currentNoteId}`, { title, content }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNotes(notes.map(note => note.id === currentNoteId ? { ...note, title, content } : note));
            setIsModalVisible(false);
            notification.success({
                message: 'Note Updated',
                description: 'Your note has been updated successfully.'
            });
        } catch (error) {
            console.error('Failed to update note:', error);
            notification.error({
                message: 'Failed to Update Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!noteId) {
            notification.error({
                message: 'Delete Failed',
                description: 'Invalid note ID.'
            });
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setNotes(notes.filter(note => note.id !== noteId));
            notification.success({
                message: 'Note Deleted',
                description: 'Your note has been deleted successfully.'
            });
        } catch (error) {
            console.error('Failed to delete note:', error);
            notification.error({
                message: 'Failed to Delete Note',
                description: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    const showUpdateModal = (note) => {
        setCurrentNoteId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="notes-page-container">
            <Title level={2} className="notes-page-title">Notes for {username || 'Loading...'}</Title>
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
                            <Button onClick={() => showUpdateModal(item)} className="notes-list-button">Update</Button>,
                            <Button onClick={() => handleDeleteNote(item.id)} className="notes-list-button">Delete</Button>
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
            <Modal
                title="Update Note"
                open={isModalVisible}
                onOk={handleUpdateNote}
                onCancel={handleModalCancel}
                okText="Save"
                cancelText="Cancel"
            >
                <Form>
                    <Form.Item
                        label="Title"
                        rules={[{ required: true, message: 'Please input the title of the note!' }]}
                    >
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Item>
                    <Form.Item
                        label="Content"
                        rules={[{ required: true, message: 'Please input the content of the note!' }]}
                    >
                        <Input.TextArea value={content} onChange={(e) => setContent(e.target.value)} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotesPage;
