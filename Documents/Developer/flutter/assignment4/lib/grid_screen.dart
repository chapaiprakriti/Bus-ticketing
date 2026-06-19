import 'package:flutter/material.dart';

class GridScreen extends StatelessWidget {
  GridScreen({super.key});

  final List<Map<String, dynamic>> items = [
    {
      "name": "airbud",
      "image": "assets/images/airbud.png",
      "color": const Color.fromARGB(255, 24, 24, 23),
    },

    {
      "name": "adpter",
      "image": "assets/images/adpter.png",
      "color": const Color(0xFFE8E8F2),
    },

    {
      "name": "cable",
      "image": "assets/images/cable.png",
      "color": const Color(0xFFF8D8E5),
    },

    {
      "name": "bulb",
      "image": "assets/images/bulb.png",
      "color": const Color.fromARGB(255, 212, 198, 205),
    },

    {
      "name": "phone",
      "image": "assets/images/phone.png",
      "color": const Color.fromARGB(255, 106, 90, 90),
    },

    {
      "name": "radio",
      "image": "assets/images/radio.png",
      "color": const Color(0xFF9EF2E3),
    },

    {
      "name": "camera",
      "image": "assets/images/camera.png",
      "color": const Color(0xFFD23CFF),
    },

    {
      "name": "fan",
      "image": "assets/images/fan.png",
      "color": const Color(0xFFF7C6CF),
    },

    {
      "name": "lighter",
      "image": "assets/images/lighter.png",
      "color": const Color(0xFF8AF0B7),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      appBar: AppBar(
        title: const Text(
          "Grid View",
          style: TextStyle(color: Colors.white),
        ),
        centerTitle: true,
        backgroundColor: Colors.blue,
      ),

      body: Padding(
        padding: const EdgeInsets.all(10),

        child: GridView.builder(
          itemCount: items.length,

          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 0.9,
          ),

          itemBuilder: (context, index) {
            return Card(
              elevation: 4,

              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),

              child: Container(
                decoration: BoxDecoration(
                  color: items[index]["color"],
                  borderRadius: BorderRadius.circular(10),
                ),

                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(8),

                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),

                          child: Image.asset(
                            items[index]["image"],
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),

                      child: Text(
                        items[index]["name"],
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}