# 🏗️ Terraform VPC Infrastructure Setup – Mumbai Region

## ✅ Scenario

Create a VPC in the **Mumbai (`ap-south-1`) region** with:

- ✅ 1 VPC
- ✅ 2 Availability Zones: `ap-south-1a`, `ap-south-1b`
- ✅ 4 Subnets:
  - 2 Public Subnets (one in each AZ)
  - 2 Private Subnets (one in each AZ)
- ✅ 1 Internet Gateway (IGW)
- ✅ 1 NAT Gateway (in a public subnet)
- ✅ Route Tables for public and private subnets

Everything is included in **one `main.tf` file**.

---

## 🧾 Terraform Code – `main.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.28.0"
    }
  }
}

provider "aws" {
  alias  = "mumbai"
  region = "ap-south-1"

}

#VPC Creation
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "main-vpc"
  }
}

# Internet Gateway Creation
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "main-igw"
  }
}

#public Subnet 01 Creation
resource "aws_subnet" "public_subnet_01" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-01"
  }
}

#public Subnet 02 Creation
resource "aws_subnet" "public_subnet_02" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-02"
  }
}

# private Subnet 01 Creation
resource "aws_subnet" "private_subnet_01" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "ap-south-1a"
  tags = {
    Name = "private-subnet-01"
  }
}

# private Subnet 02 Creation
resource "aws_subnet" "private_subnet_02" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-south-1b"
  tags = {
    Name = "private-subnet-02"
  }
}

# Elastic IP Creation
resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags = {
    Name = "nat-eip"
  }
}

# NAT Gateway Creation
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet_01.id
  tags = {
    Name = "nat-gw"
  }
  depends_on = [aws_internet_gateway.igw]
}

# Public Route Table Creation
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-rt"
  }
}

# Route Table Association for Public Subnet 01
resource "aws_route_table_association" "public_subnet_01_association" {
  subnet_id      = aws_subnet.public_subnet_01.id
  route_table_id = aws_route_table.public_rt.id
}

# Route Table Association for Public Subnet 02
resource "aws_route_table_association" "public_subnet_02_association" {
  subnet_id      = aws_subnet.public_subnet_02.id
  route_table_id = aws_route_table.public_rt.id
}

# Private Route Table Creation
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "private-rt"
  }
}

# Route Table Association for Private Subnet 01
resource "aws_route_table_association" "private_subnet_01_association" {
  subnet_id      = aws_subnet.private_subnet_01.id
  route_table_id = aws_route_table.private_rt.id
}

# Route Table Association for Private Subnet 02
resource "aws_route_table_association" "private_subnet_02_association" {
  subnet_id      = aws_subnet.private_subnet_02.id
  route_table_id = aws_route_table.private_rt.id
}

# Security Group Creation
resource "aws_security_group" "main-sg" {
  provider    = aws.mumbai
  name        = "dev-server-sg-mumbai"
  description = "Allow all inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "dev-server-sg-mumbai"
  }
}

# EC2 Instance Creation in Public Subnet 01
resource "aws_instance" "public_instance_01" {
  provider                    = aws.mumbai
  subnet_id                   = aws_subnet.public_subnet_01.id
  key_name                    = "mumbai key pair" #Note: You need to create a key pair in the Mumbai region with the name "mumbai key pair" before running this code. You can create a key pair using the AWS Management Console or using the AWS CLI.-----
  security_groups             = [aws_security_group.main-sg.id]
  ami                         = "ami-0e12ffc2dd465f6e4"
  instance_type               = "t3.small"
  associate_public_ip_address = true

  tags = {
    Name = "public-instance-01"
  }
}

# EC2 Instance Creation in Private Subnet 01
resource "aws_instance" "private_instance_01" {
  provider        = aws.mumbai
  subnet_id       = aws_subnet.private_subnet_01.id
  key_name        = "mumbai key pair" #Note: You need to create a key pair in the Mumbai region with the name "mumbai key pair" before running this code. You can create a key pair using the AWS Management Console or using the AWS CLI.-----
  security_groups = [aws_security_group.main-sg.id]

  ami           = "ami-0e12ffc2dd465f6e4"
  instance_type = "t3.small"

  tags = {
    Name = "private-instance-01"
  }

}
````

---

## 🔍 Explanation (for teaching)

| Component       | Purpose                                                         |
| --------------- | --------------------------------------------------------------- |
| VPC             | Main container for all networking resources                     |
| IGW             | Allows internet access to public subnets                        |
| Public Subnets  | EC2s launched here get public IPs and access to the internet    |
| Private Subnets | No direct internet access; routed via NAT Gateway               |
| NAT Gateway     | Provides internet access to private subnets (e.g., for updates) |
| EIP             | Static IP required for NAT Gateway                              |
| Route Tables    | Public RT routes via IGW; Private RT routes via NAT GW          |

---

## ✅ How to Run

```bash
terraform init
terraform plan
terraform apply
```

