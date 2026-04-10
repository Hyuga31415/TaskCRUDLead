import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LeadList.css'; 
import { FiSearch, FiFilter, FiPlus, FiUsers, FiPhoneCall, FiTrendingUp, FiEye, FiEdit2, FiTrash2, FiMail, FiPhone, FiX, FiUserCheck, FiCalendar, FiBriefcase } from 'react-icons/fi';

const LeadList = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Thêm state ẩn hiện bộ lọc
    const [showFilters, setShowFilters] = useState(false);

    // State cho Phân trang (Pagination)
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // State cho Modal Xác nhận
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '', 
        data: null
    });

    const [kpiStats, setKpiStats] = useState({
        total: 0, newLeads: 0, contacting: 0, converted: 0
    });

    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        keyword: '', statusId: '', provinceId: '', organizationId: '', sourceId: ''
    });

    const [metadata, setMetadata] = useState({ sources: [], organizations: [], provinces: [] });

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${d}/${m}/${y} ${hh}:${mm}`;
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [srcRes, orgRes] = await Promise.all([
                    fetch('http://localhost:8080/api/v1/metadata/sources').catch(() => null),
                    fetch('http://localhost:8080/api/v1/metadata/organizations').catch(() => null),
                    fetch('http://localhost:8080/api/v1/metadata/provinces').catch(() => null) 
                ]);
                
                setMetadata({
                    sources: srcRes && srcRes.ok ? await srcRes.json() : [],
                    organizations: orgRes && orgRes.ok ? await orgRes.json() : [] 
                });
            } catch (error) {
                console.error("Lỗi khi tải metadata bộ lọc:", error);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: searchInput }));
            setPage(0); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchKPIs = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/leads');
            if (response.ok) {
                const allData = await response.json();
                setKpiStats({
                    total: allData.length,
                    newLeads: allData.filter(l => Number(l.statusId) === 1).length,
                    contacting: allData.filter(l => Number(l.statusId) === 2).length,
                    converted: allData.filter(l => Number(l.statusId) === 3).length,
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải KPI:", error);
        }
    }, []);

    const fetchLeads = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filters.keyword) params.append('keyword', filters.keyword);
            if (filters.statusId) params.append('statusId', filters.statusId);
            if (filters.provinceId) params.append('provinceId', filters.provinceId);
            if (filters.organizationId) params.append('organizationId', filters.organizationId);
            if (filters.sourceId) params.append('sourceId', filters.sourceId);
            
            params.append('page', page);
            params.append('size', 10); 

            const response = await fetch(`http://localhost:8080/api/v1/leads/search?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setLeads(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách Lead:", error);
            toast.error("Không thể tải danh sách Khách hàng!");
        } finally {
            setIsLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        fetchKPIs();
    }, [fetchKPIs]);

    const openModal = (type, data) => setConfirmModal({ isOpen: true, type, data });
    const closeModal = () => setConfirmModal({ isOpen: false, type: '', data: null });

    const executeAction = async () => {
        const { type, data } = confirmModal;
        closeModal();

        if (type === 'DELETE') {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/leads/${data.id}`, { method: 'DELETE' });
                if (response.ok) {
                    toast.success("Đã xóa khách hàng thành công!");
                    fetchLeads(); 
                    fetchKPIs();  
                } else {
                    toast.error("Xóa thất bại!");
                }
            } catch (error) {
                toast.error("Lỗi kết nối máy chủ!");
            }
        } 
        else if (type === 'CONVERT') {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/leads/${data.id}/convert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    toast.success("Chuyển đổi thành công!");
                    fetchLeads(); 
                    fetchKPIs();  
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Lỗi chuyển đổi!");
                }
            } catch (error) {
                toast.error("Lỗi kết nối máy chủ!");
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0); 
    };

    const clearFilters = () => {
        setSearchInput('');
        setFilters({ keyword: '', statusId: '', provinceId: '', organizationId: '', sourceId: '' });
        setPage(0);
    };

    const hasActiveFilters = searchInput || filters.statusId || filters.provinceId || filters.organizationId || filters.sourceId;

    const renderStatusBadge = (statusId) => {
        switch (Number(statusId)) {
            case 1: return <span className="badge badge-new">Mới</span>;
            case 2: return <span className="badge badge-contacting">Đang liên hệ</span>;
            case 3: return <span className="badge badge-converted">Đã chuyển đổi</span>;
            case 4: return <span className="badge badge-transaction">Phát sinh GD</span>;
            case 5: return <span className="badge badge-stop">Ngừng chăm sóc</span>;
            default: return <span className="badge badge-new">Chưa cập nhật</span>;
        }
    };

    return (
        <div className="lead-container">
            <h2 className="page-title">Quản lý Khách hàng Tiềm năng</h2>
            <p className="page-subtitle">Theo dõi và quản lý toàn bộ khách hàng tiềm năng của bạn</p>

            <div className="kpi-wrapper">
                <div className="kpi-card">
                    <div className="kpi-info"><h4>Tổng số KHTN</h4><p>{kpiStats.total}</p></div>
                    <FiUsers className="kpi-icon icon-blue" />
                </div>
                <div className="kpi-card">
                    <div className="kpi-info"><h4>Mới</h4><p className="text-blue">{kpiStats.newLeads}</p></div>
                    <div className="kpi-icon icon-blue-text">N</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-info"><h4>Đang liên hệ</h4><p className="text-orange">{kpiStats.contacting}</p></div>
                    <FiPhoneCall className="kpi-icon icon-orange" />
                </div>
                <div className="kpi-card">
                    <div className="kpi-info"><h4>Đã chuyển đổi</h4><p className="text-green">{kpiStats.converted}</p></div>
                    <FiTrendingUp className="kpi-icon icon-green" />
                </div>
            </div>

            {/* Giao diện bộ lọc bám sát thiết kế mới */}
            <div className="toolbar-container">
                <div className="toolbar-top">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                            placeholder="Tìm kiếm theo tên, công ty, số điện thoại, email..." 
                        />
                    </div>
                    
                    {/* Đã thêm onClick để đổi state showFilters */}
                    <button 
                        className={`btn-filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Bộ lọc
                    </button>

                    <Link to="/leads/create" className="btn-add">
                        <FiPlus /> Thêm KHTN
                    </Link>
                </div>

                {/* Khối dropdown chỉ hiển thị khi showFilters = true */}
                {showFilters && (
                    <div className="toolbar-filters">
                        <div className="filter-group">
                            <label>Tỉnh/Thành phố</label>
                            <select name="provinceId" value={filters.provinceId} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                {metadata.privic.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Nhóm bán hàng</label>
                            <select name="organizationId" value={filters.organizationId} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                {metadata.provinces.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Trạng thái</label>
                            <select name="statusId" value={filters.statusId} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                <option value="1">Mới</option>
                                <option value="2">Đang liên hệ</option>
                                <option value="3">Đã chuyển đổi</option>
                                <option value="4">Phát sinh giao dịch</option>
                                <option value="5">Ngừng chăm sóc</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Nguồn</label>
                            <select name="sourceId" value={filters.sourceId} onChange={handleFilterChange}>
                                <option value="">Tất cả</option>
                                {metadata.sources.map(src => <option key={src.id} value={src.id}>{src.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="toolbar-footer">
                        <button className="btn-clear-filter" onClick={clearFilters}>
                            <FiX /> Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>

            <div className="table-container">
                <table className="lead-table">
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Thông tin Liên hệ</th>
                            <th>Ngày tạo</th>
                            <th>Doanh thu DK</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id}>
                                <td>
                                    <Link to={`/leads/view/${lead.id}`} className="link-name">{lead.contactName}</Link>
                                    {lead.companyName && <span className="text-sub"><FiBriefcase className="inline-icon"/> {lead.companyName}</span>}
                                </td>
                                <td>
                                    <span className="text-sub mt-0"><FiPhone className="inline-icon" /> {lead.phone}</span>
                                    {lead.email && <span className="text-sub"><FiMail className="inline-icon" /> {lead.email}</span>}
                                </td>
                                <td>
                                    <span className="text-bold"><FiCalendar className="inline-icon" /> {formatDateTime(lead.createdAt)}</span>
                                </td>
                                <td>
                                    <span className="text-bold text-dark">
                                        {lead.expectedRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lead.expectedRevenue) : '---'}
                                    </span>
                                </td>
                                <td>{renderStatusBadge(lead.statusId)}</td>
                                <td>
                                    <div className="action-icons">
                                        {Number(lead.statusId) !== 3 && !lead.isConverted && (
                                            <span title="Chuyển đổi" onClick={() => openModal('CONVERT', lead)} className="icon-convert"><FiUserCheck /></span>
                                        )}
                                        <Link to={`/leads/view/${lead.id}`} title="Xem"><FiEye /></Link>
                                        <Link to={`/leads/edit/${lead.id}`} title="Sửa"><FiEdit2 /></Link>
                                        <span title="Xóa" className="icon-delete" onClick={() => openModal('DELETE', lead)}><FiTrash2 /></span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && !isLoading && (
                            <tr><td colSpan="6" className="text-center">Không tìm thấy dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 0 && (
                <div className="pagination-container">
                    <span className="pagination-info">
                        Hiển thị {page * 10 + 1} - {Math.min((page + 1) * 10, totalElements)} trong {totalElements} KHTN
                    </span>
                    <div className="pagination-controls">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="pagination-btn">Trước</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} className={`pagination-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
                                {i + 1}
                            </button>
                        ))}
                        <button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)} className="pagination-btn">Sau</button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>{confirmModal.type === 'DELETE' ? 'Xác nhận xóa' : 'Xác nhận chuyển đổi'}</h3>
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn {confirmModal.type === 'DELETE' ? 'xóa vĩnh viễn' : 'chuyển đổi'} KHTN 
                                <strong> "{confirmModal.data?.contactName}"</strong> không? 
                                {confirmModal.type === 'DELETE' && " Hành động này không thể hoàn tác."}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-cancel" onClick={closeModal}>Hủy bỏ</button>
                            <button 
                                className={`btn-modal-confirm ${confirmModal.type === 'DELETE' ? 'btn-danger' : 'btn-success'}`}
                                onClick={executeAction}
                            >
                                {confirmModal.type === 'DELETE' ? 'Xóa dữ liệu' : 'Chuyển đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadList;