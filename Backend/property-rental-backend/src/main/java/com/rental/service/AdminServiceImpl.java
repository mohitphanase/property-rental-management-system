package com.rental.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rental.daos.BookingDao;
import com.rental.daos.PaymentDao;
import com.rental.daos.PropertyDao;
import com.rental.daos.UserDao;
import com.rental.dto.AdminMonthlyDataDto;
import com.rental.dto.AdminStatsDto;
import com.rental.dto.AdminTopPropertyDto;
import com.rental.dto.AdminUserDto;
import com.rental.entity.BookingStatus;
import com.rental.entity.PaymentStatus;
import com.rental.entity.Property;
import com.rental.entity.Role;
import com.rental.entity.User;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class AdminServiceImpl {
	
	private UserDao userDao;
	private PropertyDao propertyDao;
	private BookingDao bookingDao;
	private PaymentDao paymentDao;
	private ModelMapper modelMapper;
	
	
	
	@Autowired
	public AdminServiceImpl(UserDao userDao, PropertyDao propertyDao, BookingDao bookingDao,
			PaymentDao paymentDao, ModelMapper modelMapper) {
		this.userDao = userDao;
		this.propertyDao = propertyDao;
		this.bookingDao = bookingDao;
		this.paymentDao = paymentDao;
		this.modelMapper = modelMapper;
	}
	
	// Get all users
		public List<AdminUserDto> getAllUsers() {

			return userDao.findAll().stream().map(user -> modelMapper.map(user, AdminUserDto.class)).collect(Collectors.toList());
		}
		
		
		// Get users filtered by role
		public List<AdminUserDto> getUsersByRole(Role role) {

			return userDao.findByRole(role).stream().map(user -> modelMapper.map(user, AdminUserDto.class)).collect(Collectors.toList());
		}
		
		
		// Delete a user
		public void deleteUser(Long userId) {

			User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

			userDao.delete(user);
		}
		
		
		// Get all properties (admin view)
		public List<Property> getAllProperties() {

			return propertyDao.findAll();
		}
		
		
		
		// Delete a property
		public void deleteProperty(Long propertyId) {

			Property property = propertyDao.findById(propertyId).orElseThrow(() -> new RuntimeException("Property not found"));

			propertyDao.delete(property);
		}
		
		
		
		// Dashboard summary stats
		public AdminStatsDto getStats() {

			long totalUsers = userDao.count();
			long totalOwners = userDao.countByRole(Role.OWNER);
			long totalTenants = userDao.countByRole(Role.TENANT);
			long totalProperties = propertyDao.count();
			long totalBookings = bookingDao.count();
			long pendingBookings = bookingDao.countByStatus(BookingStatus.PENDING);

			BigDecimal totalRevenue = paymentDao.getTotalRevenue();

			LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
			long newUsersThisWeek = userDao.countByCreatedAtAfter(oneWeekAgo);

			return new AdminStatsDto(totalUsers,totalOwners,totalTenants,totalProperties,totalBookings,pendingBookings,totalRevenue,newUsersThisWeek);
		}
		
		
		// Revenue grouped by month (BarChart)
		public List<AdminMonthlyDataDto> getMonthlyRevenue() {

			List<Object[]> rows = paymentDao.getRevenueGroupedByMonth();

			return rows.stream().map(row -> new AdminMonthlyDataDto((String) row[0],(BigDecimal) row[1])).collect(Collectors.toList());
		}
		
		
		
		// Bookings grouped by month (LineChart)
		public List<AdminMonthlyDataDto> getMonthlyBookings() {

			List<Object[]> rows = bookingDao.countBookingsGroupedByMonth();

			return rows.stream().map(row -> new AdminMonthlyDataDto((String) row[0],BigDecimal.valueOf((Long) row[1]))).collect(Collectors.toList());
		}
		
		
		
		// Top properties by booking count (PieChart)
		public List<AdminTopPropertyDto> getTopProperties() {

			List<Object[]> rows = bookingDao.findTopPropertiesByBookingCount();

			return rows.stream()
					.map(row -> new AdminTopPropertyDto((Long) row[0],(String) row[1],(Long) row[2])).collect(Collectors.toList());
		}
		
		
		
		// Payment status breakdown
		public long getPaymentCountByStatus(PaymentStatus status) {

			return paymentDao.countByPaymentStatus(status);
		}

}
