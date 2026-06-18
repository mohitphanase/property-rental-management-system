package com.rental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.Resp;
import com.rental.entity.Role;
import com.rental.service.AdminServiceImpl;

@RestController
@RequestMapping("/admin")
public class AdminController {
	
	private AdminServiceImpl adminService;
	
	@Autowired
	public AdminController(AdminServiceImpl adminService) {
		this.adminService = adminService;
	}
	
	
	// GET /admin/users  (optionally ?role=OWNER / TENANT / ADMIN)
		@GetMapping("/users")
		public Resp<?> getUsers(@RequestParam(required = false) Role role) {

			if (role != null) {
				return Resp.success(adminService.getUsersByRole(role));
			}

			return Resp.success(adminService.getAllUsers());
		}
		
		
		// DELETE /admin/users/{id}
		@DeleteMapping("/users/{id}")
		public Resp<?> deleteUser(@PathVariable Long id) {

			adminService.deleteUser(id);

			return Resp.success("User deleted successfully");
		}
		
		
		
		// GET /admin/properties
		@GetMapping("/properties")
		public Resp<?> getProperties() {

			return Resp.success(adminService.getAllProperties());
		}

		
		
		
		// DELETE /admin/properties/{id}
		@DeleteMapping("/properties/{id}")
		public Resp<?> deleteProperty(@PathVariable Long id) {

			adminService.deleteProperty(id);

			return Resp.success("Property deleted successfully");
		}
		
		
		
		
		// GET /admin/stats  (dashboard summary cards)
		@GetMapping("/stats")
		public Resp<?> getStats() {

			return Resp.success(adminService.getStats());
		}
		
		
		
		// GET /admin/revenue  (BarChart - revenue grouped by month)
		@GetMapping("/revenue")
		public Resp<?> getMonthlyRevenue() {

			return Resp.success(adminService.getMonthlyRevenue());
		}
		
		
		
		// GET /admin/bookings  (LineChart - bookings grouped by month)
		@GetMapping("/bookings")
		public Resp<?> getMonthlyBookings() {

			return Resp.success(adminService.getMonthlyBookings());
		}
		
		
		
		// GET /admin/top-properties  (PieChart - top properties by booking count)
		@GetMapping("/top-properties")
		public Resp<?> getTopProperties() {

			return Resp.success(adminService.getTopProperties());
		}

	
	
}
