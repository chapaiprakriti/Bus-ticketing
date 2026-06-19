import 'package:flutter/material.dart';

class Employee {
  final int id;
  final String fullName;
  final String gender;
  final String department;
  final String username;
  final String password;

  Employee({
    required this.id,
    required this.fullName,
    required this.gender,
    required this.department,
    required this.username,
    required this.password,
  });
}

class EmployeeScreen extends StatelessWidget {
  EmployeeScreen({super.key});

  final List<Employee> employees = [
    Employee(
      id: 1,
      fullName: "Ram",
      gender: "Male",
      department: "IT",
      username: "ram123",
      password: "pass123",
    ),

    Employee(
      id: 2,
      fullName: "Hari",
      gender: "Male",
      department: "HR",
      username: "hari456",
      password: "hr2024",
    ),

    Employee(
      id: 3,
      fullName: "Sita",
      gender: "Female",
      department: "Finance",
      username: "sita789",
      password: "fin567",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,

      appBar: AppBar(
        title: const Text(
          "Employee Screen",
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.blue,
      ),

      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: employees.length,

        itemBuilder: (context, index) {
          final e = employees[index];

          return Card(
            elevation: 5,
            margin: const EdgeInsets.only(bottom: 15),

            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),

            child: Container(
              padding: const EdgeInsets.all(15),

              decoration: BoxDecoration(
                color: index % 2 == 0
                    ? const Color(0xFFE3F2FD)
                    : const Color(0xFFFFF3E0),

                borderRadius: BorderRadius.circular(15),
              ),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Text(
                    "Employee ID : ${e.id}",
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Full Name : ${e.fullName}",
                    style: const TextStyle(fontSize: 17),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Gender : ${e.gender}",
                    style: const TextStyle(fontSize: 17),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Department : ${e.department}",
                    style: const TextStyle(fontSize: 17),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Username : ${e.username}",
                    style: const TextStyle(fontSize: 17),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Password : ${e.password}",
                    style: const TextStyle(fontSize: 17),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}