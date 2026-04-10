import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LeadForm.css'; 
import { FiUser, FiBriefcase, FiPhone, FiMail, FiHash, FiCreditCard, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';

const LeadForm = ({ isEditMode, onSuccess }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        contactName: '', companyName: '', phone: '', email: '', taxCode: '', citizenId: '',
        address: '', website: '', provinceId: '', description: '', expectedRevenue: '', 
        statusId: 1, 
        sourceId: '', campaignId: '', assignedTo: '', organizationId: '',
        productInterestIds: [] 
    });
    
    const [metadata, setMetadata] = useState({
        products: [], sources: [], campaigns: [], users: [], provinces: []
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // State cho Custom Modal Xác nhận
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '' // 'CANCEL' hoặc 'SUBMIT'
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [prodRes, srcRes, campRes, userRes, proRes] = await Promise.all([
                    fetch('http://localhost:8080/api/v1/metadata/products').catch(()=>null),
                    fetch('http://localhost:8080/api/v1/metadata/sources').catch(()=>null),
                    fetch('http://localhost:8080/api/v1/metadata/campaigns').catch(()=>null),
                    fetch('http://localhost:8080/api/v1/metadata/users').catch(()=>null),
                    fetch('http://localhost:8080/api/v1/metadata/provinces').catch(()=>null)
                ]);
                
                setMetadata({
                    products: prodRes && prodRes.ok ? await prodRes.json() : [],
                    sources: srcRes && srcRes.ok ? await srcRes.json() : [],
                    campaigns: campRes && campRes.ok ? await campRes.json() : [],
                    users: userRes && userRes.ok ? await userRes.json() : [],
                    provinces: proRes && proRes.ok ? await proRes.json() : []
                });
            } catch (error) {
                console.error("Lỗi khi tải metadata:", error);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (isEditMode && id) {
            const fetchLeadDetail = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch(`http://localhost:8080/api/v1/leads/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            ...data,
                            productInterestIds: data.productInterestIds || [],
                            address: data.address || '',
                            website: data.website || '',
                            description: data.description || '',
                            expectedRevenue: data.expectedRevenue || '',
                            sourceId: data.sourceId || '',
                            campaignId: data.campaignId || '',
                            assignedTo: data.assignedTo || '',
                            organizationId: data.organizationId || ''
                        });
                    }
                } catch (error) {
                    toast.error("Lỗi khi lấy chi tiết khách hàng!");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLeadDetail();
        }
    }, [isEditMode, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'expectedRevenue') {
            const rawValue = value.replace(/\D/g, '');
            setFormData({ ...formData, [name]: rawValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const toggleProduct = (productId) => {
        setFormData((prev) => {
            const currentIds = prev.productInterestIds || [];
            const isSelected = currentIds.includes(productId);
            if (isSelected) {
                return { ...prev, productInterestIds: currentIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productInterestIds: [...currentIds, productId] };
            }
        });
    };

    const validateForm = () => {
        let newErrors = {};
        const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const taxRegex = /^[0-9]{10}(-[0-9]{3})?$/;
        const cccdRegex = /^[0-9]{12}$/;

        if (!formData.contactName.trim()) newErrors.contactName = "Tên liên hệ không được để trống";
        if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Email không đúng định dạng";
        if (formData.taxCode && formData.taxCode.trim() !== '' && !taxRegex.test(formData.taxCode)) newErrors.taxCode = "Mã số thuế không hợp lệ (10 hoặc 13 số)";
        if (formData.citizenId && formData.citizenId.trim() !== '' && !cccdRegex.test(formData.citizenId)) newErrors.citizenId = "CCCD/CMND phải bao gồm 12 chữ số";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm gọi khi nhấn nút Lưu (Chỉ mở Modal xác nhận, chưa gọi API)
    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường bị lỗi!");
            return;
        }
        setConfirmModal({ isOpen: true, type: 'SUBMIT' });
    };

    // Hàm gọi khi nhấn nút Hủy bỏ (Mở Modal xác nhận Hủy)
    const handleCancelClick = (e) => {
        e.preventDefault();
        setConfirmModal({ isOpen: true, type: 'CANCEL' });
    };

    // Thực thi hành động thực sự sau khi Xác nhận trên Modal
    const executeAction = async () => {
        const { type } = confirmModal;
        setConfirmModal({ isOpen: false, type: '' });

        if (type === 'CANCEL') {
            navigate('/leads');
            return;
        }

        if (type === 'SUBMIT') {
            setIsLoading(true);
            const url = isEditMode ? `http://localhost:8080/api/v1/leads/${id}` : `http://localhost:8080/api/v1/leads`;
            const method = isEditMode ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                statusId: formData.statusId ? parseInt(formData.statusId) : 1,
                provinceId: formData.provinceId ? parseInt(formData.provinceId) : null,
                sourceId: formData.sourceId ? parseInt(formData.sourceId) : null,
                campaignId: formData.campaignId ? parseInt(formData.campaignId) : null,
                assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
                organizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
            };

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Có lỗi xảy ra khi lưu dữ liệu");
                }

                toast.success(isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!");
                if (onSuccess) onSuccess();
                navigate('/leads');
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        if (e.target.tagName.toLowerCase() === 'textarea') return;
        if (e.target.type === 'button' || e.target.type === 'submit') return; // Không chặn Enter khi ở nút bấm

        e.preventDefault();

        const form = e.target.form;
        if (!form) return;

        const elements = Array.from(form.elements).filter(
            el => !el.disabled && !el.readOnly && el.type !== 'hidden'
        );

        const currentIndex = elements.indexOf(e.target);

        if (currentIndex > -1 && currentIndex < elements.length - 1) {
            elements[currentIndex + 1].focus();
        }
    };

    if (isLoading && isEditMode) return <div className="form-page"><p className="loading-text">Đang tải dữ liệu...</p></div>;
    const isConverted = Number(formData.statusId) === 3;

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-header">
                    <h2>{isEditMode ? 'Chỉnh sửa Khách hàng Tiềm năng' : 'Thêm mới Khách hàng Tiềm năng'}</h2>
                    <p>Vui lòng điền các thông tin cần thiết bên dưới để hệ thống lưu trữ.</p>
                </div>

                <form onSubmit={handlePreSubmit} onKeyDown={handleKeyDown}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Tên liên hệ <span className="required">*</span></label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange}
                                    className={`form-input ${errors.contactName ? 'is-invalid' : ''}`} placeholder="Nhập họ và tên..." 
                                    disabled={isConverted}/>
                            </div>
                            {errors.contactName && <span className="error-text">{errors.contactName}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tên công ty</label>
                            <div className="input-wrapper">
                                <FiBriefcase className="input-icon" />
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                    className="form-input" placeholder="Nhập tên công ty (nếu có)..." 
                                    disabled={isConverted}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <div className="input-wrapper">
                                <FiPhone className="input-icon" />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className={`form-input ${errors.phone ? 'is-invalid' : ''}`} placeholder="Ví dụ: 0901234567" 
                                    disabled={isConverted}/>
                            </div>
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={`form-input ${errors.email ? 'is-invalid' : ''}`} placeholder="Ví dụ: email@congty.com" 
                                    disabled={isConverted}/>
                            </div>
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mã số thuế</label>
                            <div className="input-wrapper">
                                <FiHash className="input-icon" />
                                <input type="text" name="taxCode" value={formData.taxCode} onChange={handleChange}
                                    className={`form-input ${errors.taxCode ? 'is-invalid' : ''}`} placeholder="Mã số thuế doanh nghiệp" 
                                    disabled={isConverted}/>
                            </div>
                            {errors.taxCode && <span className="error-text">{errors.taxCode}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">CCCD / CMND</label>
                            <div className="input-wrapper">
                                <FiCreditCard className="input-icon" />
                                <input type="text" name="citizenId" value={formData.citizenId} onChange={handleChange}
                                    className={`form-input ${errors.citizenId ? 'is-invalid' : ''}`} placeholder="Gồm 12 chữ số" 
                                    disabled={isConverted}/>
                            </div>
                            {errors.citizenId && <span className="error-text">{errors.citizenId}</span>}
                        </div>

                        <div className="form-grid full-width border-top-custom">
                            <div className="form-group">
                                <label className="form-label">Trạng thái Lead</label>
                                <select 
                                    name="statusId" 
                                    value={formData.statusId} 
                                    onChange={handleChange} 
                                    className="form-input pl-10"
                                    disabled={isConverted}
                                >
                                    <option value="1">Mới</option>
                                    <option value="2">Đang liên hệ</option>
                                    {Number(formData.statusId) === 3 && <option value="3">Đã chuyển đổi</option>}
                                    <option value="4">Phát sinh giao dịch</option>
                                    <option value="5">Ngừng chăm sóc</option>
                                </select>
                                {Number(formData.statusId) === 3 && (
                                    <span className="warning-text">* Khách hàng đã chuyển đổi, không thể thay đổi trạng thái.</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nguồn Khách Hàng</label>
                                <select name="sourceId" value={formData.sourceId} onChange={handleChange} className="form-input pl-10"
                                        disabled={isConverted}>
                                    <option value="">-- Chọn Nguồn --</option>
                                    {metadata.sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Chiến dịch Marketing</label>
                                <select name="campaignId" value={formData.campaignId} onChange={handleChange} className="form-input pl-10"
                                        disabled={isConverted}>
                                    <option value="">-- Chọn Chiến dịch --</option>
                                    {metadata.campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Người phụ trách (Sale)</label>
                                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="form-input pl-10"
                                        disabled={isConverted}>
                                    <option value="">-- Chọn Sale --</option>
                                    {metadata.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Doanh thu dự kiến (VNĐ)</label>
                                <div className="input-wrapper">
                                    <span className="currency-symbol">₫</span>
                                    <input 
                                        type="text"
                                        name="expectedRevenue" 
                                        value={formData.expectedRevenue ? formData.expectedRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ''} 
                                        disabled={isConverted}
                                        onChange={handleChange}
                                        className="form-input pl-28"
                                        placeholder="Ví dụ: 50.000.000" 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tỉnh / Thành phố</label>
                                <select name="provinceId" value={formData.provinceId} onChange={handleChange} className="form-input pl-10"
                                        disabled={isConverted}>
                                    <option value="">-- Chọn Tỉnh/TP --</option>
                                    {metadata.provinces.map(pro => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Địa chỉ</label>
                                <input type="text" name="address" value={formData.address} 
                                        disabled={isConverted} onChange={handleChange}
                                    className="form-input pl-10" placeholder="Số nhà, Tên đường, Phường/Xã..." />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Ghi chú / Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleChange}
                                    disabled={isConverted} className="form-input textarea-custom" placeholder="Nhập mô tả về khách hàng này..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-group full-width mt-10">
                        <label className="form-label">Dịch vụ/Sản phẩm đang quan tâm</label>
                        <div className="product-grid">
                            {metadata.products.map(product => {
                                const currentIds = formData.productInterestIds || [];
                                const isSelected = currentIds.includes(product.id);
                                return (
                                    <label key={product.id} className={`product-tag ${isSelected ? 'selected' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            disabled={isConverted}
                                            checked={isSelected} 
                                            onChange={() => toggleProduct(product.id)}
                                        />
                                        {isSelected ? <FiCheckCircle className="check-icon" /> : <div className="spacer-18"></div>}
                                        {product.name}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-actions">
                        {/* Thay đổi nút Hủy bỏ để bật Modal thay vì Link */}
                        <button type="button" className="btn-cancel" onClick={handleCancelClick}>
                            <FiX /> Hủy bỏ
                        </button>
                        
                        {/* Ẩn nút Lưu nếu đã Convert để người dùng không bấm được */}
                        {!isConverted && (
                            <button type="submit" className="btn-save" disabled={isLoading}>
                                <FiSave /> {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Custom Modal dành cho Xác nhận Hủy / Lưu */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>{confirmModal.type === 'CANCEL' ? 'Xác nhận hủy' : 'Xác nhận lưu'}</h3>
                            <button type="button" className="modal-close" onClick={() => setConfirmModal({isOpen: false, type: ''})}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <p>
                                {confirmModal.type === 'CANCEL' 
                                    ? 'Những thay đổi của bạn sẽ không được lưu. Bạn có chắc chắn muốn hủy bỏ?'
                                    : (isEditMode ? 'Bạn có chắc chắn muốn cập nhật thông tin khách hàng này?' : 'Bạn có chắc chắn muốn tạo mới khách hàng tiềm năng này?')}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-modal-cancel" onClick={() => setConfirmModal({isOpen: false, type: ''})}>Đóng</button>
                            <button 
                                type="button"
                                className={`btn-modal-confirm ${confirmModal.type === 'CANCEL' ? 'btn-danger' : 'btn-success'}`}
                                onClick={executeAction}
                            >
                                {confirmModal.type === 'CANCEL' ? 'Đồng ý hủy' : 'Đồng ý lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadForm;