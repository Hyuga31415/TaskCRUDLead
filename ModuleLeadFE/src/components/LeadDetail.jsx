import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    FiUser, FiBriefcase, FiPhone, FiMail, FiHash, FiCreditCard, FiArrowLeft, 
    FiGlobe, FiMapPin, FiInfo, FiDollarSign, FiActivity, FiUserCheck 
} from 'react-icons/fi';
import './LeadForm.css';

const LeadDetail = () => {
    const { id } = useParams();
    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [metadata, setMetadata] = useState({ products: [], sources: [], campaigns: [], users: [] });

    const fetchLeadData = async () => {
        try {
            const [leadRes, prodRes, srcRes, campRes, userRes] = await Promise.all([
                fetch(`http://localhost:8080/api/v1/leads/${id}`),
                fetch('http://localhost:8080/api/v1/metadata/products').catch(() => null),
                fetch('http://localhost:8080/api/v1/metadata/sources').catch(() => null),
                fetch('http://localhost:8080/api/v1/metadata/campaigns').catch(() => null),
                fetch('http://localhost:8080/api/v1/metadata/users').catch(() => null)
            ]);

            if (leadRes.ok) setLead(await leadRes.json());
            
            setMetadata({
                products: prodRes && prodRes.ok ? await prodRes.json() : [],
                sources: srcRes && srcRes.ok ? await srcRes.json() : [],
                campaigns: campRes && campRes.ok ? await campRes.json() : [],
                users: userRes && userRes.ok ? await userRes.json() : []
            });
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu chi tiết:", error);
            toast.error("Lỗi tải dữ liệu khách hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadData();
    }, [id]);

    const handleConvert = async () => {
        if (window.confirm(`Xác nhận chuyển đổi Khách hàng tiềm năng "${lead.contactName}" thành Khách hàng chính thức?`)) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/leads/${lead.id}/convert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    toast.success("Chuyển đổi thành công!");
                    fetchLeadData();
                } else {
                    const error = await response.json();
                    toast.error(error.message || "Có lỗi xảy ra khi chuyển đổi.");
                }
            } catch (error) {
                toast.error("Lỗi kết nối máy chủ.");
            }
        }
    };

    if (isLoading) return <div className="form-page"><p className="loading-text">Đang tải thông tin chi tiết...</p></div>;
    if (!lead) return <div className="form-page"><p className="loading-text">Không tìm thấy thông tin khách hàng.</p></div>;

    const getSourceName = (sourceId) => metadata.sources.find(s => s.id === sourceId)?.name || '---';
    const getCampaignName = (campaignId) => metadata.campaigns.find(c => c.id === campaignId)?.name || '---';
    const getUserName = (userId) => metadata.users.find(u => u.id === userId)?.name || '---';
    const getProductName = (productId) => metadata.products.find(p => p.id === productId)?.name || `Sản phẩm #${productId}`;

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="detail-header-flex">
                    <div>
                        <h2>Chi tiết Khách hàng Tiềm năng</h2>
                        <p>Mã KH: #{lead.id}</p>
                    </div>
                    
                    <div className="detail-header-actions">
                        {Number(lead.statusId) !== 3 && !lead.isConverted && (
                            <button onClick={handleConvert} className="btn-convert-action">
                                <FiUserCheck /> Chuyển đổi KH
                            </button>
                        )}
                        <Link to="/leads" className="btn-back-action">
                            <FiArrowLeft /> Quay về
                        </Link>
                    </div>
                </div>

                <div className="form-grid">
                    <InfoItem icon={<FiUser />} label="Tên liên hệ" value={lead.contactName} />
                    <InfoItem icon={<FiBriefcase />} label="Tên công ty" value={lead.companyName || '---'} />
                    <InfoItem icon={<FiPhone />} label="Số điện thoại" value={lead.phone} />
                    <InfoItem icon={<FiMail />} label="Email" value={lead.email || '---'} />
                    <InfoItem icon={<FiHash />} label="Mã số thuế" value={lead.taxCode || '---'} />
                    <InfoItem icon={<FiCreditCard />} label="CCCD / CMND" value={lead.citizenId || '---'} />
                    <InfoItem icon={<FiGlobe />} label="Website" value={lead.website || '---'} />
                    <InfoItem icon={<FiMapPin />} label="Địa chỉ" value={lead.address || '---'} />
                    
                    <div className="form-group">
                        <label className="form-label"><FiDollarSign /> Doanh thu dự kiến</label>
                        <p className="revenue-text">
                            {lead.expectedRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lead.expectedRevenue) : '---'}
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FiActivity /> Trạng thái hiện tại</label>
                        <div className="mt-5px">
                            <StatusBadge statusId={lead.statusId} />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label"><FiInfo /> Nguồn / Phụ trách</label>
                        <div className="info-box-custom">
                            <strong>Nguồn:</strong> {getSourceName(lead.sourceId)} <br/>
                            <strong>Chiến dịch:</strong> {getCampaignName(lead.campaignId)} <br/>
                            <strong>Người phụ trách:</strong> {getUserName(lead.assignedTo)}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Dịch vụ quan tâm</label>
                        <div className="tag-container-custom">
                            {lead.productInterestIds && lead.productInterestIds.length > 0 ? (
                                lead.productInterestIds.map(pid => (
                                    <span key={pid} className="view-tag-custom">
                                        {getProductName(pid)}
                                    </span>
                                ))
                            ) : 'Chưa có dịch vụ nào được chọn.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="form-group">
        <label className="form-label flex-center gap-8">
            {icon} {label}
        </label>
        <p className="info-value">{value}</p>
    </div>
);

const StatusBadge = ({ statusId }) => {
    switch (Number(statusId)) {
        case 1: return <span className="badge-pill bg-pill-blue">Mới</span>;
        case 2: return <span className="badge-pill bg-pill-yellow">Đang liên hệ</span>;
        case 3: return <span className="badge-pill bg-pill-green">Đã chuyển đổi</span>;
        case 4: return <span className="badge-pill bg-pill-indigo">Phát sinh GD</span>;
        case 5: return <span className="badge-pill bg-pill-red">Ngừng chăm sóc</span>;
        default: return <span className="badge-pill bg-pill-gray">Chưa cập nhật</span>;
    }
};

export default LeadDetail;